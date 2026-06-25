import { z } from 'zod'

import { abilitySchema, abilityScoreSchema } from '../vocab/ability'
import { alignmentSchema } from '../vocab/alignment'
import { creatureSizeSchema } from '../vocab/creature-size'
import { creatureTypeSchema } from '../vocab/creature-type'
import { senseSchema } from '../vocab/sense'
import { speedSchema } from '../vocab/movement-mode'
import { skillSchema } from './skill-proficiency'

/**
 * Shared creature value objects for contracts that describe creatures.
 *
 * Future monster schemas should compose these pieces into a catalog content
 * record: `contentMetaSchema.extend(monsterBodySchema.shape)`, with stat-block
 * fields such as size, creatureType, speed, senses, challenge rating, actions,
 * and explicit skill/save modifiers. Do not model monsters by extending
 * `characterSchema`; characters are owned sheets, monsters are content records.
 */

// ---------------------------------------------------------------------------
// Creature identity and physical profile references
// ---------------------------------------------------------------------------

export const creatureAlignmentSchema = alignmentSchema
export const creatureSizeRefSchema = creatureSizeSchema
export const creatureTypeRefSchema = creatureTypeSchema
export const creatureSpeedSchema = speedSchema
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
export const creatureRuntimeHitPointsSchema = z.object({
  base: z.number().int().min(0),
  temporary: z.number().int().min(0),
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
// Stat-block modifiers
// ---------------------------------------------------------------------------

/**
 * Explicit skill modifier for stat blocks.
 *
 * Monsters often publish final skill values that are better treated as authored
 * outputs than derived proficiency ranks.
 */
export const creatureSkillModifierEntrySchema = z.object({
  skill: skillSchema,
  modifier: z.number().int(),
})

export type CreatureSkillModifierEntry = z.infer<typeof creatureSkillModifierEntrySchema>

/**
 * Explicit saving throw modifier for stat blocks.
 *
 * Character saving throw proficiency can remain class/feature derived; monsters
 * can store the final stat-block modifier directly.
 */
export const creatureSavingThrowModifierEntrySchema = z.object({
  ability: abilitySchema,
  modifier: z.number().int(),
})

export type CreatureSavingThrowModifierEntry = z.infer<
  typeof creatureSavingThrowModifierEntrySchema
>
