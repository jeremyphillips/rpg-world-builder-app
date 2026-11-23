import type { SystemRulesetId } from '@rpg/contracts'

import type { CampaignRulesetUnresolvedReason } from '@/lib/campaign-ruleset.lib'

import type { ContentFormCtx } from '../forms/registry/content-form-registry'

export type ContentAuthoringScopeUnresolvedReason =
  | CampaignRulesetUnresolvedReason
  | 'missing_campaign_id'
  | 'missing_ruleset_id'

export type ContentAuthoringScope =
  | {
      status: 'campaign-ready'
      campaignId: string
      rulesetId: SystemRulesetId
    }
  | {
      status: 'unresolved'
      reason: ContentAuthoringScopeUnresolvedReason
    }

/** Campaign catalog + ruleset scope for authoring and player preview — not equipment reference scope. */
export function contentAuthoringScopeFromCtx(
  ctx: Pick<ContentFormCtx, 'campaignId' | 'rulesetId'>,
): ContentAuthoringScope {
  if (!ctx.campaignId) {
    return { status: 'unresolved', reason: 'missing_campaign_id' }
  }
  if (!ctx.rulesetId) {
    return { status: 'unresolved', reason: 'missing_ruleset_id' }
  }
  return {
    status: 'campaign-ready',
    campaignId: ctx.campaignId,
    rulesetId: ctx.rulesetId as SystemRulesetId,
  }
}

/** Campaign id for list/query hooks — never substitutes empty string for missing context. */
export function contentAuthoringCampaignIdForQueries(
  ctx: Pick<ContentFormCtx, 'campaignId' | 'rulesetId'>,
): string | undefined {
  const scope = contentAuthoringScopeFromCtx(ctx)
  return scope.status === 'campaign-ready' ? scope.campaignId : ctx.campaignId || undefined
}

/** Ruleset id for entity artwork on edit — entity identity over campaign catalog ruleset. */
export function contentEntityArtworkRulesetId(
  ctx: Pick<ContentFormCtx, 'entityRulesetId' | 'rulesetId'>,
): string | undefined {
  return ctx.entityRulesetId ?? ctx.rulesetId
}
