import type { SystemRulesetId } from '@rpg/contracts'

import { CONTENT_TIMESTAMP, STORY_CAMPAIGN_ID, STORY_RULESET_ID } from '../constants'

/** Shared homebrew envelope fields for synthetic content test entities. */
export const syntheticContentMeta = {
  rulesetId: STORY_RULESET_ID,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: STORY_CAMPAIGN_ID,
  createdAt: CONTENT_TIMESTAMP,
  updatedAt: CONTENT_TIMESTAMP,
} satisfies {
  rulesetId: SystemRulesetId
  source: 'homebrew'
  status: 'published'
  campaignId: string
  createdAt: string
  updatedAt: string
}

export function syntheticContentId(slug: string): string {
  return `${STORY_RULESET_ID}:${slug}`
}
