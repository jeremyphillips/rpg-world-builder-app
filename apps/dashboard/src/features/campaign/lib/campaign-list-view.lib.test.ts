import { describe, expect, it } from 'vitest'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import { hasCampaignRows } from './campaign-list-view.lib'

describe('hasCampaignRows', () => {
  it('returns false when campaigns are undefined or empty', () => {
    expect(hasCampaignRows(undefined)).toBe(false)
    expect(hasCampaignRows([])).toBe(false)
  })

  it('returns true when any campaign rows exist, including all-incomplete memberships', () => {
    expect(
      hasCampaignRows([
        makeCampaignListItem({
          viewerState: VIEWER_STATE.onboardingIncomplete,
          campaignRole: 'pc',
          controlledCharacterIds: [],
        }),
      ]),
    ).toBe(true)
  })
})
