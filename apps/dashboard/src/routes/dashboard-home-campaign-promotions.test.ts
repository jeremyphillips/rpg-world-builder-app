import { describe, expect, it } from 'vitest'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { resolveDashboardHomeCampaignPromotions } from './dashboard-home-campaign-promotions'

describe('resolveDashboardHomeCampaignPromotions', () => {
  it('returns no promotions when the query fails', () => {
    expect(
      resolveDashboardHomeCampaignPromotions(undefined, true, { lastSelectedCampaignId: 'camp_1' }),
    ).toEqual({
      continueCampaign: null,
      resumeSetupCampaign: null,
      showAllCampaignsLink: false,
    })
  })

  it('returns resume setup when onboarding is incomplete', () => {
    const incomplete = makeCampaignListItem({
      id: 'camp_incomplete',
      viewerOnboardingState: 'incomplete',
    })

    expect(resolveDashboardHomeCampaignPromotions([incomplete], false, null)).toEqual({
      continueCampaign: null,
      resumeSetupCampaign: incomplete,
      showAllCampaignsLink: false,
    })
  })
})
