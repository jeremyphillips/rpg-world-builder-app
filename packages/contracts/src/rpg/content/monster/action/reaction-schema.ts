import { z } from 'zod'

import { activationTriggerSchema } from '../../../primitives/activation-trigger'
import { entryProvenanceField } from '../../../primitives/provenance'
import { draftActionFields, omitActionKinds, publishedActionFields, strict } from './schema-helpers'
import { ACTION_REFERENCE_CHOOSE_FROM_ACTIONS } from './reference-messages'
import { parryAcBonusSchema, type MonsterActionMode } from './shared-fragments'
import type { MonsterAction, MonsterActionDraft } from './actions-schema'

const reactionTriggerField = { trigger: activationTriggerSchema.optional() } as const

function reactionReferenceSchema(mode: MonsterActionMode) {
  const actionIds =
    mode === 'draft'
      ? z.array(z.string().min(1)).max(1).default([])
      : z.array(z.string().min(1)).min(1, ACTION_REFERENCE_CHOOSE_FROM_ACTIONS).max(1)
  return z.object({
    id: z.string().min(1),
    kind: z.literal('action-reference'),
    name: z.string().min(1).optional(),
    trigger: activationTriggerSchema.optional(),
    description: z.string().optional(),
    actionIds,
    available: z.boolean().optional(),
    ...entryProvenanceField,
  })
}

function parrySchema(mode: MonsterActionMode) {
  return z.object({
    id: z.string().min(1),
    kind: z.literal('parry'),
    name: strict(z.string().min(1), mode),
    acBonus: mode === 'draft' ? parryAcBonusSchema.optional() : parryAcBonusSchema,
    /** Absent when the on-miss disclosure is closed. An empty string is an open, unset attack. */
    followUpActionId: z.string().min(1, 'Choose an attack.').optional(),
    available: z.boolean().optional(),
    ...entryProvenanceField,
  })
}

function extendReactionSources<T extends { shape: { kind: z.ZodType } }>(options: readonly T[]) {
  return omitActionKinds(options, [
    'weapon',
    'natural-weapon',
    'attack',
    'save',
    'multiattack',
    'action-reference',
  ]).map((option) => (option as unknown as z.ZodObject).extend(reactionTriggerField))
}

const publishedReactionReferenceSchema = reactionReferenceSchema('published')
const draftReactionReferenceSchema = reactionReferenceSchema('draft')
const publishedParrySchema = parrySchema('published')
const draftParrySchema = parrySchema('draft')

function reactionSchema(mode: MonsterActionMode) {
  const extended =
    mode === 'published'
      ? extendReactionSources(publishedActionFields)
      : extendReactionSources(draftActionFields)
  const reference =
    mode === 'published' ? publishedReactionReferenceSchema : draftReactionReferenceSchema
  const parry = mode === 'published' ? publishedParrySchema : draftParrySchema
  return z.discriminatedUnion('kind', [...extended, reference, parry] as unknown as [
    z.ZodObject,
    z.ZodObject,
    ...z.ZodObject[],
  ])
}

type ReactionTrigger = { trigger?: { text: string } }

export const monsterReactionSchema = reactionSchema(
  'published',
) as unknown as z.ZodType<MonsterReaction>
export const monsterReactionDraftSchema = reactionSchema(
  'draft',
) as unknown as z.ZodType<MonsterReactionDraft>

export type MonsterReaction =
  | (Extract<MonsterAction, { kind: 'spell' | 'special' }> & ReactionTrigger)
  | z.infer<typeof publishedReactionReferenceSchema>
  | z.infer<typeof publishedParrySchema>
export type MonsterReactionDraft =
  | (Extract<MonsterActionDraft, { kind: 'spell' | 'special' }> & ReactionTrigger)
  | z.infer<typeof draftReactionReferenceSchema>
  | z.infer<typeof draftParrySchema>
