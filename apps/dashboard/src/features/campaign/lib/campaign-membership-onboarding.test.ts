import { describe, expect, it } from 'vitest'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import { isCampaignMembershipOnboardingIncomplete } from './campaign-membership-onboarding'

describe('isCampaignMembershipOnboardingIncomplete', () => {
  it('returns true when viewerState is onboarding_incomplete', () => {
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ viewerState: VIEWER_STATE.onboardingIncomplete }),
      ),
    ).toBe(true)
  })

  it('returns false for complete, invalid, and staff onboarding states', () => {
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ viewerState: VIEWER_STATE.ready }),
      ),
    ).toBe(false)
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ viewerState: VIEWER_STATE.controlStale('char_1') }),
      ),
    ).toBe(false)
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ campaignRole: 'owner', viewerState: VIEWER_STATE.ready }),
      ),
    ).toBe(false)
  })
})
