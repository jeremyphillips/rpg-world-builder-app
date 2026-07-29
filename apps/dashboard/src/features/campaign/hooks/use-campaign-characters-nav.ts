import { useMemo } from 'react'

import { useCampaigns } from './use-campaigns'
import { buildCampaignCharactersNavModel } from '../lib/build-campaign-characters-nav-model'

/** Resolve campaign characters navigation labels and visibility for the active campaign. */
export function useCampaignCharactersNav(campaignId: string | undefined) {
  const { data: campaigns = [] } = useCampaigns()

  return useMemo(() => {
    const campaign = campaigns.find((entry) => entry.id === campaignId)
    if (!campaign) {
      return buildCampaignCharactersNavModel({ role: 'observer', controlledCount: 0 })
    }

    return buildCampaignCharactersNavModel({
      role: campaign.campaignRole,
      controlledCount: campaign.controlledCharacterIds.length,
    })
  }, [campaignId, campaigns])
}
