import { z } from 'zod'
import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'

import { abilityScoreSchema } from '../vocab/ability'
import { alignmentSchema } from '../vocab/alignment'
import { damageTypeIdSchema, getDamageTypeLabel } from '../vocab/damage'
import { effectConditionSchema } from '../vocab/effect-condition'
import { creatureSizeSchema } from '../vocab/creature-size'
import { creatureTypeSchema } from '../vocab/creature-type'
import { SENSE_RANGES, senseDraftSchema, senseSchema } from '../vocab/sense'
import { movementSpeedsSchema } from '../vocab/movement-mode'
import { skillSchema } from './skill-proficiency'
import { proficiencyRankSchema } from '../vocab/proficiency'
import { weaponProficiencyGrantSetSchema } from '../primitives/proficiency/typed-proficiency-grant-set'
import { weaponCategorySchema } from '../vocab/weapon/category'
import { equipmentInstanceSchema, equipmentInstanceSchemaBase } from './equipment/instance/instance'

/**
 * Shared creature value objects for contracts that describe creatures.
 *
 * Future monster schemas should compose these pieces into a catalog content
 * record: `contentMetaSchema.extend(monsterBodySchema.shape)`, with stat-block
 * fields such as size, creatureType, movement, senses, challenge rating, actions,
 * and explicit skill/save modifiers. Do not model monsters by extending
 * `characterSchema`; characters are owned sheets (see `rpg/runtime/`), monsters are content records.
 */

// ---------------------------------------------------------------------------
// Creature identity and physical profile references
// ---------------------------------------------------------------------------

export const creatureAlignmentSchema = alignmentSchema
export const creatureSizeRefSchema = creatureSizeSchema
export const creatureTypeRefSchema = creatureTypeSchema
export const creatureMovementSchema = movementSpeedsSchema
export const creatureSensesSchema = z.array(senseSchema).default([])

export const creatureSensesDraftSchema = z.array(senseDraftSchema).default([])

const SENSE_RANGE_PRESETS: readonly number[] = SENSE_RANGES

export {
  TELEPATHY_MILE_FEET,
  creatureCommunicationSchema,
  refineCreatureTelepathyRange,
  EMPTY_CREATURE_COMMUNICATION,
  type CreatureCommunication,
} from './creature/communication'
export {
  creatureLanguageProficiencyEntrySchema,
  type CreatureLanguageProficiencyEntry,
} from './creature/proficiencies'
export { formatTelepathyRange } from './creature/communication'

/** Publish validation — every sense row needs a range in feet. */
export function refineCreatureSenseRanges(
  senses: readonly { type: string; range?: number }[],
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  senses.forEach((sense, index) => {
    if (sense.range === undefined) {
      addCustomRefinementIssue(ctx, 'Enter a range in feet for each sense.', [
        ...path,
        index,
        'range',
      ])
      return
    }
    if (!SENSE_RANGE_PRESETS.includes(sense.range)) {
      addCustomRefinementIssue(ctx, 'Choose a sense range in feet.', [...path, index, 'range'])
    }
  })
}

// ---------------------------------------------------------------------------
// Ability scores
// ---------------------------------------------------------------------------

export const creatureAbilityScoresSchema = z.object({
  str: abilityScoreSchema,
  dex: abilityScoreSchema,
  con: abilityScoreSchema,
  int: abilityScoreSchema,
  wis: abilityScoreSchema,
  cha: abilityScoreSchema,
})

export type CreatureAbilityScores = z.infer<typeof creatureAbilityScoresSchema>

// ---------------------------------------------------------------------------
// Hit points
// ---------------------------------------------------------------------------

/**
 * Runtime hit points for owned sheets or encounter state.
 *
 * This represents mutable creature state, not monster catalog stat-block text.
 */
export const creatureRuntimeHitPointsSchema = z
  .object({
    base: z.number().int().min(0),
    current: z.number().int().min(0),
    temporary: z.number().int().min(0),
  })
  .superRefine((hitPoints, ctx) => {
    if (hitPoints.current > hitPoints.base) {
      addCustomRefinementIssue(ctx, 'Current hit points cannot exceed the maximum.', ['current'])
    }
  })

export type CreatureRuntimeHitPoints = z.infer<typeof creatureRuntimeHitPointsSchema>

/**
 * Monster stat-block hit points.
 *
 * `average` stores the rendered average value. `formula` can hold SRD-style
 * dice text such as "6d8 + 18" without forcing a full roll-expression grammar
 * before monsters are modeled.
 */
export const creatureStatBlockHitPointsSchema = z.object({
  average: z.number().int().min(0),
  formula: z.string().min(1).optional(),
})

export type CreatureStatBlockHitPoints = z.infer<typeof creatureStatBlockHitPointsSchema>

// ---------------------------------------------------------------------------
// Proficiency entries (neutral — characters extend with sources / mastery)
// ---------------------------------------------------------------------------

export const creatureSkillProficiencyEntrySchema = z.object({
  skill: skillSchema,
  rank: proficiencyRankSchema,
})

export type CreatureSkillProficiencyEntry = z.infer<typeof creatureSkillProficiencyEntrySchema>

export const creatureWeaponProficiencyTargetSchema = z
  .object({
    weaponId: z.string().min(1).optional(),
    weaponCategory: weaponCategorySchema.optional(),
  })
  .superRefine((target, ctx) => {
    const hasWeaponId = target.weaponId !== undefined
    const hasCategory = target.weaponCategory !== undefined
    if (hasWeaponId === hasCategory) {
      addCustomRefinementIssue(
        ctx,
        'Provide exactly one of weaponId or weaponCategory.',
        hasWeaponId ? ['weaponCategory'] : ['weaponId'],
      )
    }
  })

export type CreatureWeaponProficiencyTarget = z.infer<typeof creatureWeaponProficiencyTargetSchema>

/** Monster and class weapon proficiency buckets at rest (`categories` + `items`). */
export const creatureWeaponProficienciesSchema = weaponProficiencyGrantSetSchema

export type CreatureWeaponProficiencies = z.infer<typeof creatureWeaponProficienciesSchema>

export const EMPTY_CREATURE_WEAPON_PROFICIENCIES: CreatureWeaponProficiencies = {
  categories: [],
  items: [],
}

export const creatureDefensesSchema = z.object({
  vulnerabilities: z.array(damageTypeIdSchema).default([]),
  resistances: z.array(damageTypeIdSchema).default([]),
  immunities: z.array(damageTypeIdSchema).default([]),
  conditionImmunities: z.array(effectConditionSchema).default([]),
})

export type CreatureDefenses = z.infer<typeof creatureDefensesSchema>

const DAMAGE_DEFENSE_LISTS = ['vulnerabilities', 'resistances', 'immunities'] as const

export type CreatureDamageDefenseList = (typeof DAMAGE_DEFENSE_LISTS)[number]

export const CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES = {
  vulnerabilities: { label: 'Vulnerabilities', noun: 'vulnerability' },
  resistances: { label: 'Resistances', noun: 'resistance' },
  immunities: { label: 'Immunities', noun: 'immunity' },
} as const satisfies Record<CreatureDamageDefenseList, { label: string; noun: string }>

const DAMAGE_DEFENSE_NOUN = {
  vulnerabilities: CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES.vulnerabilities.noun,
  resistances: CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES.resistances.noun,
  immunities: CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES.immunities.noun,
} as const

/** Per-option disabled state for damage-defense comboboxes (cross-list exclusion). */
export function resolveDamageDefenseOptionState(
  damageTypeId: string,
  activeList: CreatureDamageDefenseList,
  defenses: {
    vulnerabilities?: readonly string[]
    resistances?: readonly string[]
    immunities?: readonly string[]
  },
): { disabled: boolean; disabledReason?: string } {
  for (const list of DAMAGE_DEFENSE_LISTS) {
    if (list === activeList) continue
    if ((defenses[list] ?? []).includes(damageTypeId)) {
      return {
        disabled: true,
        disabledReason: `Already in ${CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES[list].label}`,
      }
    }
  }
  return { disabled: false }
}

/** Publish guard: a damage type belongs to at most one damage-defense list. */
export function refineCreatureDamageDefenses(
  defenses: {
    vulnerabilities?: readonly string[]
    resistances?: readonly string[]
    immunities?: readonly string[]
  },
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const seen = new Map<string, (typeof DAMAGE_DEFENSE_LISTS)[number]>()
  for (const list of DAMAGE_DEFENSE_LISTS) {
    for (const [index, damageType] of (defenses[list] ?? []).entries()) {
      const prior = seen.get(damageType)
      if (prior) {
        addCustomRefinementIssue(
          ctx,
          `${getDamageTypeLabel(damageType)} is already a ${DAMAGE_DEFENSE_NOUN[prior]}.`,
          [...prefix, list, index],
        )
      } else {
        seen.set(damageType, list)
      }
    }
  }
}

export { equipmentInstanceSchema, equipmentInstanceSchemaBase }
export type { EquipmentInstance } from './equipment/instance/instance'
