import { ACTION_PLAN_UNCHANGED_REASONS, DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { resolveBulkCampaignAccessPreview } from './resolve-bulk-campaign-access-preview'

describe('resolveBulkCampaignAccessPreview', () => {
  it('returns plan-aware changed and unchanged counts', () => {
    const preview = resolveBulkCampaignAccessPreview(
      [
        {
          id: 'a',
          name: 'Alpha',
          campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        },
        {
          id: 'b',
          name: 'Beta',
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
      unchangedReasons: [ACTION_PLAN_UNCHANGED_REASONS.already_available],
      plan: {
        targets: [
          {
            status: 'unchanged',
            targetId: 'a',
            targetName: 'Alpha',
            reason: ACTION_PLAN_UNCHANGED_REASONS.already_available,
          },
          { status: 'wouldChange', targetId: 'b', targetName: 'Beta' },
        ],
      },
    })
  })
})
