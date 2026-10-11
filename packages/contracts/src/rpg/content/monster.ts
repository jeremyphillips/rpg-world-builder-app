import { z } from 'zod'

import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'
import { abilitySchema } from '../vocab/ability'
import { challengeRatingSchema, CHALLENGE_RATING_MECHANICS } from '../vocab/challenge-rating'
import { damageTypeIdSchema } from '../vocab/damage'
import { effectConditionSchema } from '../vocab/effect-condition'
import { languageIdSchema } from '../vocab/language'
import {
  creatureAbilityScoresSchema,
  creatureAlignmentSchema,
  creatureMovementSchema,
  creatureSensesSchema,
  creatureSizeRefSchema,
  creatureSkillProficiencyEntrySchema,
  creatureStatBlockHitPointsSchema,
  creatureTypeRefSchema,
  creatureWeaponProficiencyTargetSchema,
  equipmentInstanceSchema,
} from './creature'
import { customContentTraitSchema } from './lib/grants/grants'
import { MONSTER_CONTENT_TYPE_TERM } from '../primitives/content/content-type-terms'
import {
  createDraftInputSchema,
  createPublishInputSchema,
  draftStoredSchema,
  publishStoredSchema,
} from './lib/content-input-schemas'
import { contentPatchBaseSchema, type ContentMeta } from './lib/envelope'
import {
  mediaBearingAuthoredContentBodySchema,
  mediaBearingDraftAuthoredContentBodySchema,
} from './lib/media/media-bearing-content'
import {
  monsterActionDraftSchema,
  monsterActionSchema,
  monsterReactionDraftSchema,
  monsterReactionSchema,
  refineMonsterActionShape,
} from './monster/action'

export {
  monsterActionSchema,
  monsterReactionSchema,
  monsterActionDraftSchema,
  monsterReactionDraftSchema,
} from './monster/action'
export type { MonsterAction, MonsterReaction } from './monster/action'
import type { EquipmentModifier } from './equipment/modifier'

const atMostOneArmorClassModifier = (
  modifiers: readonly EquipmentModifier[] | undefined,
  ctx: z.RefinementCtx,
  path: (string | number)[],
) => {
  const armorMods = modifiers?.filter((m) => m.kind === 'armor_class') ?? []
  if (armorMods.length > 1) {
    addCustomRefinementIssue(ctx, 'At most one armor_class modifier per equipment instance.', path)
  }
}

export const monsterArmorClassSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('unarmored') }),
  z.object({ kind: z.literal('natural'), bonus: z.number().int().min(1) }),
  z.object({ kind: z.literal('equipment') }),
  z.object({ kind: z.literal('fixed'), value: z.number().int().min(0) }),
])

export const monsterHitPointsSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('hit-dice'), count: z.number().int().min(1) }),
  creatureStatBlockHitPointsSchema.extend({ kind: z.literal('fixed') }),
])

export const monsterTraitSchema = customContentTraitSchema
  .pick({ id: true, name: true })
  .extend({ description: z.string().min(1) })

export const monsterEquipmentEntrySchema = equipmentInstanceSchema
  .extend({ entryId: z.string().min(1) })
  .superRefine((entry, ctx) => atMostOneArmorClassModifier(entry.modifiers, ctx, ['modifiers']))

export const monsterBodyFields = {
  size: creatureSizeRefSchema,
  creatureType: creatureTypeRefSchema,
  alignment: creatureAlignmentSchema,
  abilityScores: creatureAbilityScoresSchema,
  armorClass: monsterArmorClassSchema,
  hitPoints: monsterHitPointsSchema,
  movement: creatureMovementSchema,
  hover: z.boolean().optional(),
  senses: creatureSensesSchema,
  languages: z.object({
    entries: z
      .array(
        z.object({
          language: languageIdSchema,
          speaks: z.boolean().optional(),
        }),
      )
      .default([]),
    telepathy: z.number().int().min(0).optional(),
    note: z.string().optional(),
  }),
  challengeRating: challengeRatingSchema,
  experiencePointsOverride: z.number().int().min(0).optional(),
  proficiencies: z.object({
    savingThrows: z.array(abilitySchema).default([]),
    skills: z.array(creatureSkillProficiencyEntrySchema).default([]),
    weapons: z.array(creatureWeaponProficiencyTargetSchema).default([]),
  }),
  defenses: z.object({
    vulnerabilities: z.array(damageTypeIdSchema).default([]),
    resistances: z.array(damageTypeIdSchema).default([]),
    immunities: z.array(damageTypeIdSchema).default([]),
    conditionImmunities: z.array(effectConditionSchema).default([]),
  }),
  equipment: z.array(monsterEquipmentEntrySchema).default([]),
  traits: z.array(monsterTraitSchema).default([]),
  actions: z.array(monsterActionSchema).default([]),
  bonusActions: z.array(monsterActionSchema).default([]),
  reactions: z.array(monsterReactionSchema).default([]),
} as const

export const monsterBodySchema = mediaBearingAuthoredContentBodySchema.extend(monsterBodyFields)

export type MonsterBody = z.infer<typeof monsterBodySchema>

export const monsterBodyDraftSchema = mediaBearingDraftAuthoredContentBodySchema(
  MONSTER_CONTENT_TYPE_TERM.label,
).extend({
  ...monsterBodyFields,
  size: creatureSizeRefSchema.optional(),
  creatureType: creatureTypeRefSchema.optional(),
  alignment: creatureAlignmentSchema.optional(),
  abilityScores: creatureAbilityScoresSchema.partial().optional(),
  armorClass: monsterArmorClassSchema.optional(),
  hitPoints: monsterHitPointsSchema.optional(),
  movement: creatureMovementSchema.optional(),
  senses: creatureSensesSchema.optional(),
  challengeRating: challengeRatingSchema.optional(),
  actions: z.array(monsterActionDraftSchema).default([]),
  bonusActions: z.array(monsterActionDraftSchema).default([]),
  reactions: z.array(monsterReactionDraftSchema).default([]),
})

export type MonsterBodyDraft = z.infer<typeof monsterBodyDraftSchema>

function collectActionIds(body: {
  actions: readonly { id: string }[]
  bonusActions: readonly { id: string }[]
  reactions: readonly { id: string }[]
}): string[] {
  return [
    ...body.actions.map((a) => a.id),
    ...body.bonusActions.map((a) => a.id),
    ...body.reactions.map((a) => a.id),
  ]
}

export function refineMonsterBody(
  body: MonsterBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const equipmentByEntryId = new Map(body.equipment.map((entry) => [entry.entryId, entry]))
  const entryIds = body.equipment.map((e) => e.entryId)
  if (new Set(entryIds).size !== entryIds.length) {
    addCustomRefinementIssue(ctx, 'Equipment entry ids must be unique.', [...prefix, 'equipment'])
  }

  const actionIds = collectActionIds(body)
  if (new Set(actionIds).size !== actionIds.length) {
    addCustomRefinementIssue(ctx, 'Action ids must be unique across all sections.', [
      ...prefix,
      'actions',
    ])
  }

  for (const [index, action] of body.actions.entries()) {
    refineMonsterActionShape(action, ctx, [...prefix, 'actions', index])
    if (action.kind === 'weapon') {
      if (!equipmentByEntryId.has(action.equipmentEntryId)) {
        addCustomRefinementIssue(ctx, 'Weapon action must reference an equipment entry.', [
          ...prefix,
          'actions',
          index,
          'equipmentEntryId',
        ])
      }
    }
  }

  for (const [index, action] of body.bonusActions.entries()) {
    refineMonsterActionShape(action, ctx, [...prefix, 'bonusActions', index])
  }

  for (const [index, action] of body.reactions.entries()) {
    refineMonsterActionShape(action, ctx, [...prefix, 'reactions', index])
  }

  const derivedXp = CHALLENGE_RATING_MECHANICS[body.challengeRating].xp
  if (body.experiencePointsOverride !== undefined) {
    if (body.challengeRating !== '0') {
      addCustomRefinementIssue(
        ctx,
        'Experience point override is only allowed for challenge rating 0.',
        [...prefix, 'experiencePointsOverride'],
      )
    } else if (body.experiencePointsOverride === derivedXp) {
      addCustomRefinementIssue(
        ctx,
        'Experience point override must differ from the derived CR 0 value.',
        [...prefix, 'experiencePointsOverride'],
      )
    }
  }
}

/** Stored monster record — explicit meta + body (Zod superRefine omits output typing). */
export type Monster = ContentMeta & MonsterBody

export const monsterSchema = publishStoredSchema(monsterBodySchema).superRefine((monster, ctx) =>
  refineMonsterBody(monster as MonsterBody, ctx),
) as unknown as z.ZodType<Monster>

export const monsterDraftStoredSchema = draftStoredSchema(monsterBodyDraftSchema)

export type MonsterDraft = z.infer<typeof monsterDraftStoredSchema>

const monsterPublishInputSchema = createPublishInputSchema(monsterBodySchema)

export const createMonsterInputSchema = monsterPublishInputSchema.superRefine((input, ctx) =>
  refineMonsterBody(input as MonsterBody, ctx),
)

export type CreateMonsterInput = z.infer<typeof createMonsterInputSchema>

export const createMonsterDraftInputSchema = createDraftInputSchema(monsterBodyDraftSchema)

export type CreateMonsterDraftInput = z.infer<typeof createMonsterDraftInputSchema>

export const updateMonsterInputSchema = monsterPublishInputSchema.partial()

export type UpdateMonsterInput = z.infer<typeof updateMonsterInputSchema>

export const updateMonsterDraftInputSchema = createMonsterDraftInputSchema.partial()

export type UpdateMonsterDraftInput = z.infer<typeof updateMonsterDraftInputSchema>

export const monsterPatchSchema = contentPatchBaseSchema.extend({
  patch: monsterBodySchema.partial(),
})

export type MonsterPatch = z.infer<typeof monsterPatchSchema>
