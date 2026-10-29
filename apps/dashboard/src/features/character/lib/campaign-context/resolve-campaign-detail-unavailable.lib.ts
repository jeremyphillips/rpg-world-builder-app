import type { SystemRulesetId } from '@rpg/contracts'

import type { CampaignBuildFoundationUnavailable } from './resolve-campaign-build-context-unavailable.lib'

export type CampaignDetailUnavailable =
  | CampaignBuildFoundationUnavailable
  | { kind: 'ruleset_mismatch' }

/**
 * Read-only sheet gate. Campaign assignment and NPC create require a matching
 * ruleset, so a mismatch is drifted data: show it instead of re-deriving.
 */
export function resolveCampaignDetailUnavailable(input: {
  foundationUnavailable: CampaignBuildFoundationUnavailable | null
  campaignRulesetId: SystemRulesetId | undefined
  characterRulesetId: string | undefined
}): CampaignDetailUnavailable | null {
  if (input.foundationUnavailable) return input.foundationUnavailable
  if (
    input.characterRulesetId &&
    input.campaignRulesetId &&
    input.characterRulesetId !== input.campaignRulesetId
  ) {
    return { kind: 'ruleset_mismatch' }
  }
  return null
}
