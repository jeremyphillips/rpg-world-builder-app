import { z } from 'zod'

import { overlaySlugList } from '../../lib/system-overlay/overlay-presets'
import { activationTriggerSchema } from '../../../primitives/activation-trigger'
import { entryProvenanceField } from '../../../primitives/provenance'
import type { MonsterActionSection } from '../action-sections'
import { ACTION_REFERENCE_CHOOSE_FROM_ACTIONS } from './reference-messages'
import { leapActionSchema, takeActionsSchema, teleportActionSchema } from './portable-kind-schemas'
import { monsterSectionDiscriminatedUnion, monsterSectionKindLiterals } from './section-placement'
import { intrinsicActionSchemasByKind, strict } from './schema-helpers'
import { parryAcBonusSchema, type MonsterActionMode } from './shared-fragments'

const reactionTriggerField = { trigger: activationTriggerSchema.optional() } as const

function withReactionTrigger<T extends z.ZodObject>(schema: T) {
  return schema.extend(reactionTriggerField)
}

function reactionReferenceSchema(mode: MonsterActionMode) {
  const actionIds =
    mode === 'draft'
      ? overlaySlugList(z.string().min(1)).max(1).default([])
      : overlaySlugList(z.string().min(1)).min(1, ACTION_REFERENCE_CHOOSE_FROM_ACTIONS).max(1)
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

function actionsSectionTuple<M extends MonsterActionMode>(mode: M) {
  const intrinsic = intrinsicActionSchemasByKind(mode)
  return [
    intrinsic.weapon,
    intrinsic['natural-weapon'],
    intrinsic.attack,
    intrinsic.save,
    intrinsic.spell,
    intrinsic.special,
    intrinsic.multiattack,
    intrinsic['shape-shift'],
    teleportActionSchema(mode),
  ] as const
}

function bonusActionsSectionTuple<M extends MonsterActionMode>(mode: M) {
  const intrinsic = intrinsicActionSchemasByKind(mode)
  return [
    intrinsic.attack,
    intrinsic.save,
    intrinsic.spell,
    intrinsic.special,
    leapActionSchema(mode),
    teleportActionSchema(mode),
    takeActionsSchema(mode),
    intrinsic['shape-shift'],
  ] as const
}

function reactionsSectionTuple<M extends MonsterActionMode>(mode: M) {
  const intrinsic = intrinsicActionSchemasByKind(mode)
  return [
    withReactionTrigger(intrinsic.spell),
    withReactionTrigger(intrinsic.special),
    reactionReferenceSchema(mode),
    parrySchema(mode),
  ] as const
}

function legendaryActionsSectionTuple<M extends MonsterActionMode>(mode: M) {
  const intrinsic = intrinsicActionSchemasByKind(mode)
  return [
    intrinsic['action-reference'],
    intrinsic.spell,
    intrinsic.special,
    intrinsic.save,
  ] as const
}

const ACTIONS_PUBLISHED_TUPLE = actionsSectionTuple('published')
const ACTIONS_DRAFT_TUPLE = actionsSectionTuple('draft')
const BONUS_PUBLISHED_TUPLE = bonusActionsSectionTuple('published')
const BONUS_DRAFT_TUPLE = bonusActionsSectionTuple('draft')
const REACTIONS_PUBLISHED_TUPLE = reactionsSectionTuple('published')
const REACTIONS_DRAFT_TUPLE = reactionsSectionTuple('draft')
const LEGENDARY_PUBLISHED_TUPLE = legendaryActionsSectionTuple('published')
const LEGENDARY_DRAFT_TUPLE = legendaryActionsSectionTuple('draft')

export const MONSTER_SECTION_KINDS = {
  actions: monsterSectionKindLiterals(ACTIONS_PUBLISHED_TUPLE),
  bonusActions: monsterSectionKindLiterals(BONUS_PUBLISHED_TUPLE),
  reactions: monsterSectionKindLiterals(REACTIONS_PUBLISHED_TUPLE),
  legendaryActions: monsterSectionKindLiterals(LEGENDARY_PUBLISHED_TUPLE),
} as const satisfies Record<MonsterActionSection, readonly string[]>

export const monsterActionSchema = monsterSectionDiscriminatedUnion(
  'actions',
  ACTIONS_PUBLISHED_TUPLE,
)
export const monsterActionDraftSchema = monsterSectionDiscriminatedUnion(
  'actions',
  ACTIONS_DRAFT_TUPLE,
)

export const monsterBonusActionSchema = monsterSectionDiscriminatedUnion(
  'bonusActions',
  BONUS_PUBLISHED_TUPLE,
)
export const monsterBonusActionDraftSchema = monsterSectionDiscriminatedUnion(
  'bonusActions',
  BONUS_DRAFT_TUPLE,
)

export const monsterReactionSchema = monsterSectionDiscriminatedUnion(
  'reactions',
  REACTIONS_PUBLISHED_TUPLE,
)
export const monsterReactionDraftSchema = monsterSectionDiscriminatedUnion(
  'reactions',
  REACTIONS_DRAFT_TUPLE,
)

export const monsterLegendaryActionSchema = monsterSectionDiscriminatedUnion(
  'legendaryActions',
  LEGENDARY_PUBLISHED_TUPLE,
)
export const monsterLegendaryActionDraftSchema = monsterSectionDiscriminatedUnion(
  'legendaryActions',
  LEGENDARY_DRAFT_TUPLE,
)

export const publishedReactionReferenceSchema = reactionReferenceSchema('published')
export const draftReactionReferenceSchema = reactionReferenceSchema('draft')
export const publishedParrySchema = parrySchema('published')
export const draftParrySchema = parrySchema('draft')
