import { describe, expect, it } from 'vitest'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { isCampaignMembershipOnboardingIncomplete } from './campaign-membership-onboarding'

describe('isCampaignMembershipOnboardingIncomplete', () => {
  it('returns true when viewerOnboardingState is incomplete', () => {
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ viewerOnboardingState: 'incomplete' }),
      ),
    ).toBe(true)
  })

  it('returns false for complete, invalid, and staff onboarding states', () => {
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ viewerOnboardingState: 'complete' }),
      ),
    ).toBe(false)
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ viewerOnboardingState: 'invalid' }),
      ),
    ).toBe(false)
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ campaignRole: 'owner', viewerOnboardingState: 'complete' }),
      ),
    ).toBe(false)
  })
})
