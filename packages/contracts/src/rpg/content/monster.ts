import { z } from 'zod'

import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'
import { abilitySchema } from '../vocab/ability'
import { challengeRatingSchema, CHALLENGE_RATING_MECHANICS } from '../vocab/challenge-rating'
import {
  creatureAbilityScoresSchema,
  creatureAlignmentSchema,
  creatureMovementSchema,
  creatureSensesDraftSchema,
  creatureSensesSchema,
  refineCreatureSenseRanges,
  refineCreatureTelepathyRange,
  creatureCommunicationSchema,
  EMPTY_CREATURE_COMMUNICATION,
  creatureSizesDraftSchema,
  creatureSizesSchema,
  creatureSkillProficiencyEntrySchema,
  creatureLanguageProficiencyEntrySchema,
  creatureStatBlockHitPointsSchema,
  creatureDefensesSchema,
  creatureTypeRefSchema,
  creatureWeaponProficiencyTargetSchema,
  equipmentInstanceSchemaBase,
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
  refineMonsterSpellEntries,
} from './monster/action'
import { entryProvenanceField } from '../primitives/provenance'
import { MONSTER_ACTION_SECTIONS } from './monster/action-sections'

export { MONSTER_ACTION_SECTIONS }
export type { MonsterActionSection } from './monster/action-sections'

export {
  monsterActionSchema,
  monsterReactionSchema,
  monsterActionDraftSchema,
  monsterReactionDraftSchema,
} from './monster/action'
export type {
  MonsterAction,
  MonsterActionDraft,
  MonsterReaction,
  MonsterReactionDraft,
} from './monster/action'
import type { EquipmentInstance } from './equipment/instance/instance'
import { normalizeEquipmentInstance } from './equipment/instance/normalize-equipment-instance'
import { refineEquipmentInstanceInvariants } from './equipment/instance/instance-invariants'

import { FIXED_AC_OFFSET_MIN } from '../vocab/mechanics/armor-class-scale'

export const monsterArmorClassSchema = z.object({
  naturalArmorBonus: z.number().int().min(1).optional(),
  /** Protection offset for a fixed override. Minimum -10; no maximum. */
  fixedAcOffset: z.number().int().min(FIXED_AC_OFFSET_MIN).optional(),
})

export const monsterHitPointsSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('hit-dice'), count: z.number().int().min(1) }),
  creatureStatBlockHitPointsSchema.extend({ kind: z.literal('fixed') }),
])

export const monsterTraitSchema = customContentTraitSchema
  .pick({ id: true, name: true })
  .extend({ description: z.string().min(1), ...entryProvenanceField })

export const monsterTraitDraftSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  ...entryProvenanceField,
})

const monsterEquipmentEntrySchemaParsed = equipmentInstanceSchemaBase
  .extend({ entryId: z.string().min(1) })
  .superRefine((entry, ctx) => refineEquipmentInstanceInvariants(entry, ctx))

export const monsterEquipmentEntrySchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object') return value
  return normalizeEquipmentInstance(value as EquipmentInstance)
}, monsterEquipmentEntrySchemaParsed)

export const monsterBodyFields = {
  sizes: creatureSizesSchema,
  creatureType: creatureTypeRefSchema,
  alignment: creatureAlignmentSchema,
  abilityScores: creatureAbilityScoresSchema,
  armorClass: monsterArmorClassSchema.default({}),
  hitPoints: monsterHitPointsSchema,
  movement: creatureMovementSchema,
  hover: z.boolean().optional(),
  senses: creatureSensesSchema,
  communication: creatureCommunicationSchema.default(EMPTY_CREATURE_COMMUNICATION),
  challengeRating: challengeRatingSchema,
  experiencePointsOverride: z.number().int().min(0).optional(),
  proficiencies: z.object({
    savingThrows: z.array(abilitySchema).default([]),
    skills: z.array(creatureSkillProficiencyEntrySchema).default([]),
    languages: z.array(creatureLanguageProficiencyEntrySchema).default([]),
    additionalLanguageCount: z.number().int().min(1).optional(),
    weapons: z.array(creatureWeaponProficiencyTargetSchema).default([]),
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

const monsterBodyDraftSchemaBase = mediaBearingDraftAuthoredContentBodySchema(
  MONSTER_CONTENT_TYPE_TERM.label,
).extend({
  ...monsterBodyFields,
  sizes: creatureSizesDraftSchema,
  creatureType: creatureTypeRefSchema.optional(),
  alignment: creatureAlignmentSchema.optional(),
  abilityScores: creatureAbilityScoresSchema.partial().optional(),
  hitPoints: monsterHitPointsSchema.optional(),
  movement: creatureMovementSchema.optional(),
  senses: creatureSensesDraftSchema.optional(),
  challengeRating: challengeRatingSchema.optional(),
  actions: z.array(monsterActionDraftSchema).default([]),
  bonusActions: z.array(monsterActionDraftSchema).default([]),
  reactions: z.array(monsterReactionDraftSchema).default([]),
  traits: z.array(monsterTraitDraftSchema).default([]),
})

export const monsterBodyDraftSchema = monsterBodyDraftSchemaBase

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

function refineMonsterProficiencies(
  proficiencies: MonsterBody['proficiencies'],
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
): void {
  const seenLanguages = new Set<string>()
  proficiencies.languages.forEach((entry, index) => {
    if (seenLanguages.has(entry.language)) {
      addCustomRefinementIssue(ctx, 'Language ids must be unique.', [
        ...prefix,
        'proficiencies',
        'languages',
        index,
        'language',
      ])
    }
    seenLanguages.add(entry.language)
  })

  const seenWeaponIds = new Set<string>()
  const seenWeaponCategories = new Set<string>()
  proficiencies.weapons.forEach((target, index) => {
    if (target.weaponId !== undefined) {
      if (seenWeaponIds.has(target.weaponId)) {
        addCustomRefinementIssue(ctx, 'Weapon proficiency targets must be unique.', [
          ...prefix,
          'proficiencies',
          'weapons',
          index,
          'weaponId',
        ])
      }
      seenWeaponIds.add(target.weaponId)
    }
    if (target.weaponCategory !== undefined) {
      if (seenWeaponCategories.has(target.weaponCategory)) {
        addCustomRefinementIssue(ctx, 'Weapon proficiency targets must be unique.', [
          ...prefix,
          'proficiencies',
          'weapons',
          index,
          'weaponCategory',
        ])
      }
      seenWeaponCategories.add(target.weaponCategory)
    }
  })
}

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
  refineMonsterSpellEntries(body, ctx, prefix)

  refineWeaponEntryReferences(body, ctx, prefix, { requirePresent: true })
  refineCreatureDamageDefenses(body.defenses, ctx, [...prefix, 'defenses'])
  refineCreatureSenseRanges(body.senses, ctx, [...prefix, 'senses'])
  refineCreatureTelepathyRange(body.communication.telepathy, ctx, [
    ...prefix,
    'communication',
    'telepathy',
  ])
  refineMonsterProficiencies(body.proficiencies, ctx, prefix)
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

const monsterStoredSchema = publishStoredSchema(monsterBodySchema).superRefine((monster, ctx) =>
  refineMonsterBody(monster as MonsterBody, ctx),
)

export const monsterSchema = monsterStoredSchema as unknown as z.ZodType<Monster>

function refineMonsterDraftIds(
  body: MonsterBodyDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
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
}

function refineMonsterDraftBody(
  body: MonsterBodyDraft,
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const equipment = body.equipment ?? []
  refineMonsterDraftIds(body, ctx, prefix)

  refineMonsterSpellEntries(
    {
      actions: body.actions ?? [],
      bonusActions: body.bonusActions ?? [],
      reactions: body.reactions ?? [],
    },
    ctx,
    prefix,
  )

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

const monsterDraftStoredSchemaBase = draftStoredSchema(monsterBodyDraftSchema).superRefine(
  (monster, ctx) => refineMonsterDraftBody(monster as MonsterBodyDraft, ctx),
)

export const monsterDraftStoredSchema = monsterDraftStoredSchemaBase

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
