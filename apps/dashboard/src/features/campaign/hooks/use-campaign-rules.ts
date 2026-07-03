import { useMemo } from 'react'

import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  resolveCampaignRules,
  type ResolvedCampaignRules,
} from '@rpg/contracts'

import { useRulesetPatch } from '@/features/homebrew'

const DEFAULT_CAMPAIGN_RULES: ResolvedCampaignRules = {
  maxCharacterLevel: 20,
  standardMaxCharacterLevel: 20,
  allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
  multiclassing: defaultMulticlassingRules(),
  subclassing: defaultSubclassingRules(),
}

/** Resolved campaign rules from the ruleset-patch query (defaults while loading or absent). */
export function useCampaignRules(campaignId: string | undefined): ResolvedCampaignRules {
  const { data: patch } = useRulesetPatch(campaignId)

  return useMemo(() => {
    if (!patch) return DEFAULT_CAMPAIGN_RULES
    return resolveCampaignRules(patch.characterCreation)
  }, [patch])
}
