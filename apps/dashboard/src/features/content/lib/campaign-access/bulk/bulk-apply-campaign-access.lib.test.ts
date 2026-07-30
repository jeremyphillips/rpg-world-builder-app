import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { executeBulkCampaignAccessApply } from './bulk-apply-campaign-access.lib'

const fetchCsrfToken = vi.fn()
const updateRouteContentCampaignAccess = vi.fn()

vi.mock('@rpg/contracts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@rpg/contracts')>()
  return {
    ...actual,
    fetchCsrfToken: () => fetchCsrfToken(),
  }
})

vi.mock('../campaign-access-api', () => ({
  updateRouteContentCampaignAccess: (...args: unknown[]) =>
    updateRouteContentCampaignAccess(...args),
}))

const unavailableAccess = {
  ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  available: false,
  effectiveAudience: 'none' as const,
}

const rows = [
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

describe('executeBulkCampaignAccessApply', () => {
  beforeEach(() => {
    fetchCsrfToken.mockReset()
    updateRouteContentCampaignAccess.mockReset()
    fetchCsrfToken.mockResolvedValue('shared-csrf-token')
    updateRouteContentCampaignAccess.mockResolvedValue({
      status: 'updated',
      campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    })
  })

  it('fetches CSRF once and applies all rows with the shared token', async () => {
    const result = await executeBulkCampaignAccessApply(
      rows,
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

    expect(result).toMatchObject({
      updatedIds: ['class-1', 'class-2', 'class-3'],
      blockedIds: [],
      failedIds: [],
      fullSuccess: true,
      summary: '3 items are now available in this campaign.',
    })
  })
})
