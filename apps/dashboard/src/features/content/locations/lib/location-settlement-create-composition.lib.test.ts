import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  addSettlementDistrictDraft,
  buildStartingDistrictCreateInput,
  createSettlementWithStartingDistricts,
  EMPTY_SETTLEMENT_CREATE_COMPOSITION,
  isSettlementCreateCompositionDirty,
  removeSettlementDistrictDraft,
  resolveSettlementCreateCompletionToast,
  resolveSettlementStructureAuthoringGuidance,
  updateSettlementDistrictDraft,
  validateSettlementCreateComposition,
} from './location-settlement-create-composition.lib'

vi.mock('../../lib/list/content-client', () => ({
  createContent: vi.fn(),
}))

vi.mock('../../lib/campaign-access/create-with-deferred-campaign-access', () => ({
  createWithDeferredCampaignAccess: vi.fn(),
}))

import { createContent } from '../../lib/list/content-client'
import { createWithDeferredCampaignAccess } from '../../lib/campaign-access/create-with-deferred-campaign-access'

describe('settlement create composition state', () => {
  it('tracks dirty state against the empty baseline', () => {
    expect(isSettlementCreateCompositionDirty(EMPTY_SETTLEMENT_CREATE_COMPOSITION)).toBe(false)

    const withDistrict = addSettlementDistrictDraft(EMPTY_SETTLEMENT_CREATE_COMPOSITION)
    expect(isSettlementCreateCompositionDirty(withDistrict)).toBe(true)

    const cleaned = removeSettlementDistrictDraft(withDistrict, withDistrict.districts[0]!.id)
    expect(isSettlementCreateCompositionDirty(cleaned)).toBe(false)
  })

  it('adds, updates, and removes district drafts', () => {
    const added = addSettlementDistrictDraft(EMPTY_SETTLEMENT_CREATE_COMPOSITION)
    const districtId = added.districts[0]!.id

    const updated = updateSettlementDistrictDraft(added, districtId, 'Dock Ward')
    expect(updated.districts[0]?.name).toBe('Dock Ward')

    const removed = removeSettlementDistrictDraft(updated, districtId)
    expect(removed.districts).toEqual([])
  })

  it('blocks blank district names', () => {
    const composition = addSettlementDistrictDraft(EMPTY_SETTLEMENT_CREATE_COMPOSITION)

    expect(validateSettlementCreateComposition(composition)).toEqual({
      ok: false,
      message: 'Each starting district needs a name.',
    })
  })

  it('blocks duplicate district names after trim and case fold', () => {
    const first = addSettlementDistrictDraft(EMPTY_SETTLEMENT_CREATE_COMPOSITION)
    const second = addSettlementDistrictDraft(first)

    const withNames = updateSettlementDistrictDraft(
      updateSettlementDistrictDraft(second, second.districts[0]!.id, 'Dock Ward'),
      second.districts[1]!.id,
      ' dock ward ',
    )

    expect(validateSettlementCreateComposition(withNames)).toEqual({
      ok: false,
      message: 'Starting district names must be unique.',
    })
  })
})

describe('buildStartingDistrictCreateInput', () => {
  it('builds a publish-ready district under the settlement parent', () => {
    expect(
      buildStartingDistrictCreateInput({
        settlementId: 'settlement-1',
        name: 'Dock Ward',
      }),
    ).toMatchObject({
      name: 'Dock Ward',
      kind: 'district',
      parentLocationId: 'settlement-1',
    })
  })
})

describe('createSettlementWithStartingDistricts', () => {
  beforeEach(() => {
    vi.mocked(createWithDeferredCampaignAccess).mockReset()
    vi.mocked(createContent).mockReset()
  })

  it('creates the settlement before optional districts and returns aggregate results', async () => {
    vi.mocked(createWithDeferredCampaignAccess).mockResolvedValue({
      entity: { id: 'settlement-1' },
      deferredAccessFailed: false,
    })
    vi.mocked(createContent).mockResolvedValueOnce({ id: 'district-1' })

    const added = addSettlementDistrictDraft(EMPTY_SETTLEMENT_CREATE_COMPOSITION)
    const composition = updateSettlementDistrictDraft(added, added.districts[0]!.id, 'Dock Ward')

    const result = await createSettlementWithStartingDistricts({
      campaignId: 'campaign-1',
      routeKey: 'locations',
      settlementCreateInput: {
        name: 'Harborford',
        slug: 'harborford',
        kind: 'settlement',
        settlementType: 'city',
      },
      pendingAccess: null,
      composition,
    })

    expect(createWithDeferredCampaignAccess).toHaveBeenCalledOnce()
    expect(createContent).toHaveBeenCalledOnce()
    expect(
      vi.mocked(createWithDeferredCampaignAccess).mock.invocationCallOrder[0]! <
        vi.mocked(createContent).mock.invocationCallOrder[0]!,
    ).toBe(true)
    expect(result).toEqual({
      settlement: { id: 'settlement-1' },
      deferredAccessFailed: false,
      districts: {
        created: [{ id: 'district-1', name: 'Dock Ward' }],
        failed: [],
      },
    })
  })

  it('continues after district failures without throwing once the settlement exists', async () => {
    vi.mocked(createWithDeferredCampaignAccess).mockResolvedValue({
      entity: { id: 'settlement-1' },
      deferredAccessFailed: true,
    })
    vi.mocked(createContent).mockRejectedValueOnce(new Error('network'))

    const added = addSettlementDistrictDraft(EMPTY_SETTLEMENT_CREATE_COMPOSITION)
    const composition = updateSettlementDistrictDraft(added, added.districts[0]!.id, 'Dock Ward')

    await expect(
      createSettlementWithStartingDistricts({
        campaignId: 'campaign-1',
        routeKey: 'locations',
        settlementCreateInput: {
          name: 'Harborford',
          slug: 'harborford',
          kind: 'settlement',
          settlementType: 'city',
        },
        pendingAccess: null,
        composition,
      }),
    ).resolves.toEqual({
      settlement: { id: 'settlement-1' },
      deferredAccessFailed: true,
      districts: {
        created: [],
        failed: [{ name: 'Dock Ward' }],
      },
    })
  })
})

describe('resolveSettlementCreateCompletionToast', () => {
  it('returns success when access and districts complete', () => {
    expect(
      resolveSettlementCreateCompletionToast({
        settlementType: 'city',
        deferredAccessFailed: false,
        districtsFailedCount: 0,
      }),
    ).toEqual({ kind: 'success' })
  })

  it('aggregates access and district failures into one warning', () => {
    expect(
      resolveSettlementCreateCompletionToast({
        settlementType: 'city',
        deferredAccessFailed: true,
        districtsFailedCount: 1,
      }),
    ).toEqual({
      kind: 'warning',
      message: 'City created, but campaign access and 1 starting district could not be completed.',
    })
  })
})

describe('resolveSettlementStructureAuthoringGuidance', () => {
  it('returns settlement-type-aware helper copy', () => {
    expect(resolveSettlementStructureAuthoringGuidance('city').helper).toContain('city')
    expect(resolveSettlementStructureAuthoringGuidance('hamlet').emphasis).toContain('Smaller')
  })
})
