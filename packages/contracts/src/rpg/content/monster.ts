import { z } from 'zod'

import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'
import { abilitySchema } from '../vocab/ability'
import { challengeRatingSchema, CHALLENGE_RATING_MECHANICS } from '../vocab/challenge-rating'
import { languageIdSchema } from '../vocab/language'
import {
  creatureAbilityScoresSchema,
  creatureAlignmentSchema,
  creatureMovementSchema,
  creatureSensesDraftSchema,
  creatureSensesSchema,
  refineCreatureSenseRanges,
  creatureSizeRefSchema,
  creatureSkillProficiencyEntrySchema,
  creatureStatBlockHitPointsSchema,
  creatureDefensesSchema,
  creatureTypeRefSchema,
  creatureWeaponProficienciesSchema,
  equipmentInstanceSchema,
  refineCreatureDamageDefenses,
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

export const monsterTraitDraftSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
})

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
  }),
  challengeRating: challengeRatingSchema,
  experiencePointsOverride: z.number().int().min(0).optional(),
  proficiencies: z.object({
    savingThrows: z.array(abilitySchema).default([]),
    skills: z.array(creatureSkillProficiencyEntrySchema).default([]),
    weapons: creatureWeaponProficienciesSchema.default({ categories: [], items: [] }),
  }),
  defenses: creatureDefensesSchema,
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
  senses: creatureSensesDraftSchema.optional(),
  challengeRating: challengeRatingSchema.optional(),
  actions: z.array(monsterActionDraftSchema).default([]),
  bonusActions: z.array(monsterActionDraftSchema).default([]),
  reactions: z.array(monsterReactionDraftSchema).default([]),
  traits: z.array(monsterTraitDraftSchema).default([]),
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

const MONSTER_ACTION_SECTIONS = ['actions', 'bonusActions', 'reactions'] as const

function refineUniqueIds(
  ids: readonly string[],
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string,
): void {
  const seen = new Set<string>()
  ids.forEach((id, index) => {
    if (seen.has(id)) {
      addCustomRefinementIssue(ctx, message, [...path, index, 'id'])
    }
    seen.add(id)
  })
}

function refineWeaponEntryReferences(
  body: {
    equipment: readonly { entryId: string }[]
    actions: readonly { kind: string; equipmentEntryId?: string }[]
    bonusActions: readonly { kind: string; equipmentEntryId?: string }[]
    reactions: readonly { kind: string; equipmentEntryId?: string }[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  options: { requirePresent: boolean },
): void {
  const equipmentByEntryId = new Set(body.equipment.map((entry) => entry.entryId))
  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const [index, action] of body[section].entries()) {
      if (action.kind !== 'weapon') continue
      const equipmentEntryId = action.equipmentEntryId
      if (!equipmentEntryId) {
        if (options.requirePresent) {
          addCustomRefinementIssue(ctx, 'Weapon action must reference an equipment entry.', [
            ...prefix,
            section,
            index,
            'equipmentEntryId',
          ])
        }
        continue
      }
      if (!equipmentByEntryId.has(equipmentEntryId)) {
        addCustomRefinementIssue(ctx, 'Weapon action must reference an equipment entry.', [
          ...prefix,
          section,
          index,
          'equipmentEntryId',
        ])
      }
    }
  }
}

export function refineMonsterBody(
  body: MonsterBody,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const entryIds = body.equipment.map((entry) => entry.entryId)
  if (new Set(entryIds).size !== entryIds.length) {
    addCustomRefinementIssue(ctx, 'Equipment entry ids must be unique.', [...prefix, 'equipment'])
  }

  refineUniqueIds(
    body.traits.map((trait) => trait.id),
    ctx,
    [...prefix, 'traits'],
    'Trait ids must be unique.',
  )

  const actionIds = collectActionIds(body)
  if (new Set(actionIds).size !== actionIds.length) {
    addCustomRefinementIssue(ctx, 'Action ids must be unique across all sections.', [
      ...prefix,
      'actions',
    ])
  }

  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const [index, action] of body[section].entries()) {
      refineMonsterActionShape(action, ctx, [...prefix, section, index])
    }
  }

  refineWeaponEntryReferences(body, ctx, prefix, { requirePresent: true })
  refineCreatureDamageDefenses(body.defenses, ctx, [...prefix, 'defenses'])
  refineCreatureSenseRanges(body.senses, ctx, [...prefix, 'senses'])

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

function refineMonsterDraftBody(
  body: MonsterBodyDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const equipment = body.equipment ?? []
  const entryIds = equipment.map((entry) => entry.entryId)
  if (new Set(entryIds).size !== entryIds.length) {
    addCustomRefinementIssue(ctx, 'Equipment entry ids must be unique.', [...prefix, 'equipment'])
  }

  refineUniqueIds(
    (body.traits ?? []).map((trait) => trait.id),
    ctx,
    [...prefix, 'traits'],
    'Trait ids must be unique.',
  )

  const actionIds = collectActionIds({
    actions: body.actions ?? [],
    bonusActions: body.bonusActions ?? [],
    reactions: body.reactions ?? [],
  })
  if (new Set(actionIds).size !== actionIds.length) {
    addCustomRefinementIssue(ctx, 'Action ids must be unique across all sections.', [
      ...prefix,
      'actions',
    ])
  }

  refineWeaponEntryReferences(
    {
      equipment,
      actions: body.actions ?? [],
      bonusActions: body.bonusActions ?? [],
      reactions: body.reactions ?? [],
    },
    ctx,
    prefix,
    { requirePresent: false },
  )
}

export const monsterDraftStoredSchema = draftStoredSchema(monsterBodyDraftSchema).superRefine(
  (monster, ctx) => refineMonsterDraftBody(monster as MonsterBodyDraft, ctx),
)

export type MonsterDraft = z.infer<typeof monsterDraftStoredSchema>

const monsterPublishInputSchema = createPublishInputSchema(monsterBodySchema)
const monsterDraftInputSchema = createDraftInputSchema(monsterBodyDraftSchema)

export const createMonsterInputSchema = monsterPublishInputSchema.superRefine((input, ctx) =>
  refineMonsterBody(input as MonsterBody, ctx),
)

export type CreateMonsterInput = z.infer<typeof createMonsterInputSchema>

export const createMonsterDraftInputSchema = monsterDraftInputSchema.superRefine((input, ctx) =>
  refineMonsterDraftBody(input as MonsterBodyDraft, ctx),
)

export type CreateMonsterDraftInput = z.infer<typeof createMonsterDraftInputSchema>

export const updateMonsterInputSchema = monsterPublishInputSchema.partial().extend({
  experiencePointsOverride: z.number().int().min(0).nullable().optional(),
  hover: z.boolean().nullable().optional(),
  description: z.string().nullable().optional(),
})

export type UpdateMonsterInput = z.infer<typeof updateMonsterInputSchema>

export const updateMonsterDraftInputSchema = monsterDraftInputSchema
  .partial()
  .superRefine((input, ctx) => refineMonsterDraftBody(input as MonsterBodyDraft, ctx))

export {
  collectMonsterCatalogIssues,
  MONSTER_CATALOG_ISSUE_CODE,
} from './monster/monster-catalog-issues'
export type {
  MonsterCatalogIssueBody,
  MonsterCatalogIssueCode,
  MonsterCatalogs,
} from './monster/monster-catalog-issues'

export type UpdateMonsterDraftInput = z.infer<typeof updateMonsterDraftInputSchema>

export const monsterPatchSchema = contentPatchBaseSchema.extend({
  patch: monsterBodySchema.partial(),
})

export type MonsterPatch = z.infer<typeof monsterPatchSchema>
