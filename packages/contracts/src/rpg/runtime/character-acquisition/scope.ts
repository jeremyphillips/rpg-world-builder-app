import { z } from 'zod'

import { systemRulesetIdSchema } from '../../primitives/ruleset'

export const characterRulesetScopeSchema = z.object({
  type: z.literal('ruleset'),
  rulesetId: systemRulesetIdSchema,
})

export type CharacterRulesetScope = z.infer<typeof characterRulesetScopeSchema>

export const characterCampaignRulesScopeSchema = z.object({
  type: z.literal('campaign'),
  campaignId: z.string().min(1),
  rulesetId: systemRulesetIdSchema,
})

export type CharacterCampaignRulesScope = z.infer<typeof characterCampaignRulesScopeSchema>

export const characterRulesScopeSchema = z.discriminatedUnion('type', [
  characterRulesetScopeSchema,
  characterCampaignRulesScopeSchema,
])

export type CharacterRulesScope = z.infer<typeof characterRulesScopeSchema>
