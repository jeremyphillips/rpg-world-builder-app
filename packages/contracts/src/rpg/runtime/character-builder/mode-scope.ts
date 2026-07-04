import { z } from 'zod'

import { systemRulesetIdSchema } from '../../primitives/ruleset'

// ---------------------------------------------------------------------------
// Builder mode = where/how the builder is used. Build scope = which rules and
// content context applies. Kept separate so standalone creation is never
// forced through a campaign-shaped context. The full unions are typed now;
// MVP implements only 'dashboard' + standalone.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILDER_MODES = ['public', 'dashboard', 'npc', 'import'] as const

export const characterBuilderModeSchema = z.enum(CHARACTER_BUILDER_MODES)

export type CharacterBuilderMode = z.infer<typeof characterBuilderModeSchema>

/** Modes that can run without a campaign context. */
export const STANDALONE_CHARACTER_BUILDER_MODES = [
  'public',
  'dashboard',
] as const satisfies readonly CharacterBuilderMode[]

export type StandaloneCharacterBuilderMode = (typeof STANDALONE_CHARACTER_BUILDER_MODES)[number]

/** Standalone = no campaign patch/membership context — the ruleset still applies. */
export const standaloneCharacterBuildScopeSchema = z.object({
  type: z.literal('standalone'),
  rulesetId: systemRulesetIdSchema,
})

export type StandaloneCharacterBuildScope = z.infer<typeof standaloneCharacterBuildScopeSchema>

export const campaignCharacterBuildScopeSchema = z.object({
  type: z.literal('campaign'),
  campaignId: z.string().min(1),
  rulesetId: systemRulesetIdSchema,
})

export type CampaignCharacterBuildScope = z.infer<typeof campaignCharacterBuildScopeSchema>

export const characterBuildScopeSchema = z.discriminatedUnion('type', [
  standaloneCharacterBuildScopeSchema,
  campaignCharacterBuildScopeSchema,
])

export type CharacterBuildScope = z.infer<typeof characterBuildScopeSchema>
