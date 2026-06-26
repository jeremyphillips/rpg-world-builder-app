import { useMemo } from 'react'

import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  resolveCampaignRules,
  type ResolvedCampaignRules,
} from '@rpg/contracts'

import { useCampaigns } from './use-campaigns'

const DEFAULT_CAMPAIGN_RULES: ResolvedCampaignRules = {
  maxCharacterLevel: 20,
  standardMaxCharacterLevel: 20,
  allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
}

/** Resolved campaign rules from the list cache (defaults when campaign or settings are absent). */
export function useCampaignRules(campaignId: string | undefined): ResolvedCampaignRules {
  const { data: campaigns } = useCampaigns()

  return useMemo(() => {
    if (!campaignId || !campaigns) return DEFAULT_CAMPAIGN_RULES
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return DEFAULT_CAMPAIGN_RULES
    return resolveCampaignRules(campaign.configuration.settings)
  }, [campaignId, campaigns])
}
