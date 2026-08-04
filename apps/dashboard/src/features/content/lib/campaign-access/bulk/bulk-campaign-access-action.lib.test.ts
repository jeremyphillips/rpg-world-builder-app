import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import {
  applyBulkCampaignAccessToTargets,
  bulkCampaignAccessRowRequiresAvailabilityValidation,
  validateBulkCampaignAccess,
} from './bulk-campaign-access-action.lib'

const fetchContentCampaignAccessAvailability = vi.fn()
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
  fetchContentCampaignAccessAvailability: (...args: unknown[]) =>
    fetchContentCampaignAccessAvailability(...args),
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
    fetchContentCampaignAccessAvailability.mockReset()
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

  it('validates blocked rows before apply and skips GET for visibility-only changes', async () => {
    fetchContentCampaignAccessAvailability
      .mockResolvedValueOnce({
        status: 'blocked',
        blockers: [{ kind: 'usage', characterId: 'char-1', characterName: 'Aldric' }],
      })
      .mockResolvedValueOnce({ status: 'allowed' })

    const validation = await validateBulkCampaignAccess(
      rows,
      {
        available: { kind: 'set', value: false },
        visibilityMode: { kind: 'unchanged' },
      },
      'campaign-1',
      'classes',
    )

    expect(fetchContentCampaignAccessAvailability).toHaveBeenCalledTimes(2)
    expect(validation.targets.filter((target) => target.status === 'blocked')).toHaveLength(1)

    const visibilityOnlyValidation = await validateBulkCampaignAccess(
      rows,
      {
        available: { kind: 'unchanged' },
        visibilityMode: { kind: 'set', value: 'all_players' },
      },
      'campaign-1',
      'classes',
    )

    expect(visibilityOnlyValidation.targets.every((target) => target.status === 'eligible')).toBe(
      true,
    )
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
})
