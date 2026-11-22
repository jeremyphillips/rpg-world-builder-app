import type { z } from 'zod'

import type { MonsterAction, MonsterActionDraft } from './actions-schema'
import {
  draftParrySchema,
  draftReactionReferenceSchema,
  monsterReactionDraftSchema as monsterReactionDraftSchemaBase,
  monsterReactionSchema as monsterReactionSchemaBase,
  publishedParrySchema,
  publishedReactionReferenceSchema,
} from './section-tuples'

export const monsterReactionSchema =
  monsterReactionSchemaBase as unknown as z.ZodType<MonsterReaction>
export const monsterReactionDraftSchema =
  monsterReactionDraftSchemaBase as unknown as z.ZodType<MonsterReactionDraft>

type ReactionTrigger = { trigger?: { text: string } }

export type MonsterReaction =
  | (Extract<MonsterAction, { kind: 'spell' | 'special' }> & ReactionTrigger)
  | z.infer<typeof publishedReactionReferenceSchema>
  | z.infer<typeof publishedParrySchema>
export type MonsterReactionDraft =
  | (Extract<MonsterActionDraft, { kind: 'spell' | 'special' }> & ReactionTrigger)
  | z.infer<typeof draftReactionReferenceSchema>
  | z.infer<typeof draftParrySchema>
/** Authoring input before parse defaults; use on monster form reaction rows. */
export type MonsterReactionDraftInput = z.input<typeof monsterReactionDraftSchema>
