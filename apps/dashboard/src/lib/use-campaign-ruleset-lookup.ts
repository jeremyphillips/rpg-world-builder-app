import { useMemo } from 'react'

import type { SystemRulesetId } from '@rpg/contracts'

import { useCampaigns } from '@/features/campaign'

import { lookupCampaignRulesetId, type CampaignRulesetLookup } from './campaign-ruleset.lib'

export function campaignRulesetLookupPending(
  campaignId: string | undefined,
  lookup: CampaignRulesetLookup,
): boolean {
  return Boolean(campaignId) && lookup.status === 'unresolved' && lookup.reason === 'loading'
}

export function campaignRulesetLookupFailed(
  campaignId: string | undefined,
  lookup: CampaignRulesetLookup,
): boolean {
  return (
    Boolean(campaignId) &&
    lookup.status === 'unresolved' &&
    lookup.reason !== 'loading' &&
    lookup.reason !== 'no_campaign_id'
  )
}

export function resolvedCampaignRulesetId(
  lookup: CampaignRulesetLookup,
): SystemRulesetId | undefined {
  return lookup.status === 'resolved' ? lookup.rulesetId : undefined
}

export function useCampaignRulesetLookup(campaignId: string | undefined): {
  lookup: CampaignRulesetLookup
  rulesetId: SystemRulesetId | undefined
  isPending: boolean
  isError: boolean
} {
  const campaignsQuery = useCampaigns()

  const lookup = useMemo(
    () =>
      lookupCampaignRulesetId({
        campaignId,
        campaigns: campaignsQuery.data,
        campaignsPending: campaignsQuery.isPending,
        campaignsError: campaignsQuery.isError,
      }),
    [campaignId, campaignsQuery.data, campaignsQuery.isError, campaignsQuery.isPending],
  )

  const rulesetId = resolvedCampaignRulesetId(lookup)
  const isPending = campaignRulesetLookupPending(campaignId, lookup)
  const isError = campaignRulesetLookupFailed(campaignId, lookup)

  return { lookup, rulesetId, isPending, isError }
}
