import { z } from 'zod'

import { systemRulesetIdSchema } from '../../../primitives/ruleset'
import { CHARACTER_KINDS } from '../../character-acquisition/kind'

// ---------------------------------------------------------------------------
// Character builder draft scope — explicit storage boundary per build entry.
// ---------------------------------------------------------------------------

export const campaignCharacterBuilderDraftScopeSchema = z.object({
  kind: z.literal('campaign'),
  campaignId: z.string().min(1),
  characterKind: z.enum(CHARACTER_KINDS),
})

export type CampaignCharacterBuilderDraftScope = z.infer<
  typeof campaignCharacterBuilderDraftScopeSchema
>

export const standaloneCharacterBuilderDraftScopeSchema = z.object({
  kind: z.literal('standalone'),
  userId: z.string().min(1),
  rulesetId: systemRulesetIdSchema,
  characterKind: z.enum(CHARACTER_KINDS),
})

export type StandaloneCharacterBuilderDraftScope = z.infer<
  typeof standaloneCharacterBuilderDraftScopeSchema
>

export const characterBuilderDraftScopeSchema = z.discriminatedUnion('kind', [
  campaignCharacterBuilderDraftScopeSchema,
  standaloneCharacterBuilderDraftScopeSchema,
])

export type CharacterBuilderDraftScope = z.infer<typeof characterBuilderDraftScopeSchema>

export function characterBuilderDraftScopesEqual(
  left: CharacterBuilderDraftScope,
  right: CharacterBuilderDraftScope,
): boolean {
  if (left.kind !== right.kind) return false

  if (left.kind === 'campaign') {
    return (
      right.kind === 'campaign' &&
      left.campaignId === right.campaignId &&
      left.characterKind === right.characterKind
    )
  }

  return (
    right.kind === 'standalone' &&
    left.userId === right.userId &&
    left.rulesetId === right.rulesetId &&
    left.characterKind === right.characterKind
  )
}
