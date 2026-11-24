import type { Campaign, SystemRulesetId } from '@rpg/contracts'

export type CampaignRulesetUnresolvedReason =
  | 'no_campaign_id'
  | 'loading'
  | 'error'
  | 'not_found'
  | 'missing_ruleset'

export type CampaignRulesetLookup =
  | { status: 'resolved'; rulesetId: SystemRulesetId }
  | { status: 'unresolved'; reason: CampaignRulesetUnresolvedReason }

export function lookupCampaignRulesetId(input: {
  campaignId: string | undefined
  campaigns: readonly Campaign[] | undefined
  campaignsPending: boolean
  campaignsError: boolean
}): CampaignRulesetLookup {
  if (!input.campaignId) {
    return { status: 'unresolved', reason: 'no_campaign_id' }
  }
  if (input.campaignsPending) {
    return { status: 'unresolved', reason: 'loading' }
  }
  if (input.campaignsError) {
    return { status: 'unresolved', reason: 'error' }
  }
  const campaign = input.campaigns?.find((entry) => entry.id === input.campaignId)
  if (!campaign) {
    return { status: 'unresolved', reason: 'not_found' }
  }
  if (!campaign.rulesetId) {
    return { status: 'unresolved', reason: 'missing_ruleset' }
  }
  return { status: 'resolved', rulesetId: campaign.rulesetId }
}
