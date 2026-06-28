import { useQuery } from '@tanstack/react-query'

import { fetchRulesetPatch } from '../api/ruleset-patch-api'

export function rulesetPatchQueryKey(campaignId: string) {
  return ['campaigns', campaignId, 'ruleset-patch'] as const
}

/** Load resolved ruleset patch data (character creation rules with defaults applied). */
export function useRulesetPatch(campaignId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: campaignId ? rulesetPatchQueryKey(campaignId) : [],
    queryFn: () => fetchRulesetPatch(campaignId!),
    enabled: Boolean(campaignId && enabled),
  })
}
