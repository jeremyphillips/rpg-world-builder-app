import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { resolveBulkCampaignAccessPreview } from './resolve-bulk-campaign-access-preview'

describe('resolveBulkCampaignAccessPreview', () => {
  it('returns deterministic changed and unchanged counts only', () => {
    const preview = resolveBulkCampaignAccessPreview(
      [
        { campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS },
        {
          campaignAccess: {
            ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
            available: false,
            effectiveAudience: 'none',
          },
        },
      ],
      {
        availableOption: 'true',
        visibilityModeOption: 'unchanged',
      },
    )

    expect(preview).toEqual({
      selectedCount: 2,
      wouldChangeCount: 1,
      unchangedCount: 1,
      hasChanges: true,
    })
  })
})
