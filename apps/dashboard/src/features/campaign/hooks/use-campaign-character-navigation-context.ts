import { useMemo } from 'react'

import { buildCampaignCharacterNavigationContext } from '../lib/build-campaign-character-navigation-context'
import { isCampaignMembershipOnboardingIncomplete } from '../lib/campaign-membership-onboarding'
import { useCampaigns } from './use-campaigns'

/** Resolve campaign character navigation and list context for the active campaign. */
export function useCampaignCharacterNavigationContext(campaignId: string | undefined) {
  const { data: campaigns = [] } = useCampaigns()

  return useMemo(() => {
    if (!campaignId) {
      return buildCampaignCharacterNavigationContext({
        campaignId: '',
        role: 'observer',
        openControlledCharacterIds: [],
        onboardingIncomplete: false,
      })
    }

    const campaign = campaigns.find((entry) => entry.id === campaignId)
    if (!campaign) {
      return buildCampaignCharacterNavigationContext({
        campaignId,
        role: 'observer',
        openControlledCharacterIds: [],
        onboardingIncomplete: false,
      })
    }

    return buildCampaignCharacterNavigationContext({
      campaignId,
      role: campaign.campaignRole,
      openControlledCharacterIds: campaign.openControlledCharacterIds,
      onboardingIncomplete: isCampaignMembershipOnboardingIncomplete(campaign),
    })
  }, [campaignId, campaigns])
}
