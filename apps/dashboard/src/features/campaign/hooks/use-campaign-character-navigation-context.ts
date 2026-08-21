import { useMemo } from 'react'

import { buildCampaignCharacterNavigationContext } from '../lib/characters/build-campaign-character-navigation-context'
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
        viewerState: { kind: 'ready' },
      })
    }

    const campaign = campaigns.find((entry) => entry.id === campaignId)
    if (!campaign) {
      return buildCampaignCharacterNavigationContext({
        campaignId,
        role: 'observer',
        openControlledCharacterIds: [],
        viewerState: { kind: 'ready' },
      })
    }

    return buildCampaignCharacterNavigationContext({
      campaignId,
      role: campaign.campaignRole,
      openControlledCharacterIds: campaign.openControlledCharacterIds,
      viewerState: campaign.viewerState,
    })
  }, [campaignId, campaigns])
}
