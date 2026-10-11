import { z } from 'zod'
import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'

import { abilityScoreSchema } from '../vocab/ability'
import { alignmentSchema } from '../vocab/alignment'
import { creatureSizeSchema } from '../vocab/creature-size'
import { creatureTypeSchema } from '../vocab/creature-type'
import { senseSchema } from '../vocab/sense'
import { movementSpeedsSchema } from '../vocab/movement-mode'
import { skillSchema } from './skill-proficiency'
import { proficiencyRankSchema } from '../vocab/proficiency'
import { weaponCategorySchema } from '../vocab/weapon/category'
import { equipmentInstanceSchema } from './equipment/instance'

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

export { equipmentInstanceSchema }
export type { EquipmentInstance } from './equipment/instance'
