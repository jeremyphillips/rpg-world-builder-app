import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import {
  applyBulkCampaignAccessToTargets,
  bulkCampaignAccessRowRequiresAvailabilityValidation,
  validateBulkCampaignAccess,
} from './bulk-campaign-access-action.lib'

const fetchContentCampaignAccessAvailabilityBatch = vi.fn()
const updateRouteContentCampaignAccess = vi.fn()
const fetchCsrfToken = vi.fn()

vi.mock('@rpg/contracts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@rpg/contracts')>()
  return {
    ...actual,
    fetchCsrfToken: () => fetchCsrfToken(),
  }
})

vi.mock('../campaign-access-api', () => ({
  fetchContentCampaignAccessAvailabilityBatch: (...args: unknown[]) =>
    fetchContentCampaignAccessAvailabilityBatch(...args),
  updateRouteContentCampaignAccess: (...args: unknown[]) =>
    updateRouteContentCampaignAccess(...args),
}))

const unavailableAccess = {
  ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  available: false,
  effectiveAudience: 'none' as const,
}

const availableAccess = {
  ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  available: true,
}

const rows = [
  {
    id: 'class-1',
    name: 'Wizard',
    source: 'system' as const,
    status: 'published' as const,
    campaignAccess: availableAccess,
  },
  {
    id: 'class-2',
    name: 'Fighter',
    source: 'system' as const,
    status: 'published' as const,
    campaignAccess: availableAccess,
  },
]

describe('bulk-campaign-access-action.lib', () => {
  beforeEach(() => {
    fetchContentCampaignAccessAvailabilityBatch.mockReset()
    updateRouteContentCampaignAccess.mockReset()
    fetchCsrfToken.mockReset()
    fetchCsrfToken.mockResolvedValue('shared-csrf-token')
  })

  it('requires availability validation only when turning available rows unavailable', () => {
    const formValues = {
      available: { kind: 'set' as const, value: false },
      visibilityMode: { kind: 'unchanged' as const },
    }

    expect(bulkCampaignAccessRowRequiresAvailabilityValidation(rows[0]!, formValues)).toBe(true)
    expect(
      bulkCampaignAccessRowRequiresAvailabilityValidation(
        { ...rows[0]!, campaignAccess: unavailableAccess },
        formValues,
      ),
    ).toBe(false)
  })

  it('uses one batch POST per validation pass and skips rows that do not need preflight', async () => {
    fetchContentCampaignAccessAvailabilityBatch.mockResolvedValue({
      targets: [
        {
          targetId: 'class-1',
          targetName: 'Wizard',
          availability: {
            status: 'blocked',
            blockers: [{ kind: 'usage', characterId: 'char-1', characterName: 'Aldric' }],
          },
        },
        {
          targetId: 'class-2',
          targetName: 'Fighter',
          availability: { status: 'allowed' },
        },
      ],
    })

    const validation = await validateBulkCampaignAccess(
      rows,
      {
        available: { kind: 'set', value: false },
        visibilityMode: { kind: 'unchanged' },
      },
      'campaign-1',
      'classes',
    )

    expect(fetchContentCampaignAccessAvailabilityBatch).toHaveBeenCalledTimes(1)
    expect(fetchContentCampaignAccessAvailabilityBatch).toHaveBeenCalledWith(
      'campaign-1',
      'classes',
      ['class-1', 'class-2'],
      { classId: undefined },
    )
    expect(validation.targets.filter((target) => target.status === 'blocked')).toHaveLength(1)
    expect(validation.targets.find((target) => target.targetId === 'class-2')?.status).toBe(
      'eligible',
    )

    fetchContentCampaignAccessAvailabilityBatch.mockReset()

    const visibilityOnlyValidation = await validateBulkCampaignAccess(
      rows,
      {
        available: { kind: 'unchanged' },
        visibilityMode: { kind: 'set', value: 'all_players' },
      },
      'campaign-1',
      'classes',
    )

    expect(fetchContentCampaignAccessAvailabilityBatch).not.toHaveBeenCalled()
    expect(visibilityOnlyValidation.targets.every((target) => target.status === 'eligible')).toBe(
      true,
    )
  })

  it('surfaces batch validate failures without fan-out retry', async () => {
    fetchContentCampaignAccessAvailabilityBatch.mockRejectedValue(new Error('Server unavailable'))

    await expect(
      validateBulkCampaignAccess(
        rows,
        {
          available: { kind: 'set', value: false },
          visibilityMode: { kind: 'unchanged' },
        },
        'campaign-1',
        'classes',
      ),
    ).rejects.toThrow(/Wizard|Fighter/)
  })

  it('treats malformed batch correspondence as a whole-batch validate error', async () => {
    fetchContentCampaignAccessAvailabilityBatch.mockResolvedValue({
      targets: [
        {
          targetId: 'class-1',
          targetName: 'Wizard',
          availability: { status: 'allowed' },
        },
      ],
    })

    await expect(
      validateBulkCampaignAccess(
        rows,
        {
          available: { kind: 'set', value: false },
          visibilityMode: { kind: 'unchanged' },
        },
        'campaign-1',
        'classes',
      ),
    ).rejects.toThrow(/Wizard|Fighter/)
    expect(fetchContentCampaignAccessAvailabilityBatch).toHaveBeenCalledTimes(1)
  })

  it('maps apply-time 409 blockers and operational failures separately', async () => {
    updateRouteContentCampaignAccess
      .mockResolvedValueOnce({
        status: 'updated',
        campaignAccess: unavailableAccess,
      })
      .mockRejectedValueOnce(new Error('Network error'))

    const { outcomes } = await applyBulkCampaignAccessToTargets(
      rows,
      ['class-1', 'class-2'],
      {
        available: { kind: 'set', value: false },
        visibilityMode: { kind: 'unchanged' },
      },
      'campaign-1',
      'classes',
    )

    expect(outcomes).toEqual([
      { status: 'updated', targetId: 'class-1' },
      {
        status: 'failed',
        targetId: 'class-2',
        failure: expect.objectContaining({ code: 'request_error', message: expect.any(String) }),
      },
    ])
  })

  it('fetches CSRF once and applies all rows with the shared token', async () => {
    updateRouteContentCampaignAccess.mockResolvedValue({
      status: 'updated',
      campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    })

    const bulkRows = [
      {
        id: 'class-1',
        name: 'Wizard',
        source: 'system' as const,
        status: 'published' as const,
        campaignAccess: unavailableAccess,
      },
      {
        id: 'class-2',
        name: 'Fighter',
        source: 'system' as const,
        status: 'published' as const,
        campaignAccess: unavailableAccess,
      },
      {
        id: 'class-3',
        name: 'Rogue',
        source: 'system' as const,
        status: 'published' as const,
        campaignAccess: unavailableAccess,
      },
    ]

    const { outcomes } = await applyBulkCampaignAccessToTargets(
      bulkRows,
      ['class-1', 'class-2', 'class-3'],
      {
        available: { kind: 'set', value: true },
        visibilityMode: { kind: 'unchanged' },
      },
      'campaign-1',
      'classes',
    )

    expect(fetchCsrfToken).toHaveBeenCalledTimes(1)
    expect(updateRouteContentCampaignAccess).toHaveBeenCalledTimes(3)
    for (const call of updateRouteContentCampaignAccess.mock.calls) {
      expect(call[4]).toEqual({ csrfToken: 'shared-csrf-token' })
    }

    expect(outcomes.filter((outcome) => outcome.status === 'updated')).toHaveLength(3)
  })
})
