import { describe, expect, it } from 'vitest'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { isCampaignMembershipOnboardingIncomplete } from './campaign-membership-onboarding'

describe('isCampaignMembershipOnboardingIncomplete', () => {
  it('returns true for a PC with no controlled characters', () => {
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ campaignRole: 'pc', openControlledCharacterIds: [] }),
      ),
    ).toBe(true)
  })

  it('returns false for staff roles and active PCs', () => {
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ campaignRole: 'owner', openControlledCharacterIds: [] }),
      ),
    ).toBe(false)
    expect(
      isCampaignMembershipOnboardingIncomplete(
        makeCampaignListItem({ campaignRole: 'pc', openControlledCharacterIds: ['char_1'] }),
      ),
    ).toBe(false)
  })
})
