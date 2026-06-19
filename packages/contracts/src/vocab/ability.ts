import { z } from 'zod'

// ---------------------------------------------------------------------------
// Abilities — the six creature ability scores (shared by classes, monsters,
// and characters). `class.ts` references ability *ids* only, not scores.
// ---------------------------------------------------------------------------

/**
 * Ability id -> full display name. The map doubles as form select options
 * (`value: id`, `label: ABILITIES[id]`).
 */
export const ABILITIES = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
} as const

export type Ability = keyof typeof ABILITIES

export const ABILITY_IDS = Object.keys(ABILITIES) as [Ability, ...Ability[]]

export const abilitySchema = z.enum(ABILITY_IDS)

// ---------------------------------------------------------------------------
// Ability scores — bounds are context-dependent: PCs cap at 20, monsters reach
// ~30. Groundwork for character/monster sheets; not used by class.ts.
// ---------------------------------------------------------------------------

export const ABILITY_SCORE_MIN = 1
export const PC_ABILITY_SCORE_MAX = 20
export const ABILITY_SCORE_MAX = 30

export const abilityScoreSchema = z.number().int().min(ABILITY_SCORE_MIN).max(ABILITY_SCORE_MAX)

export const pcAbilityScoreSchema = abilityScoreSchema.refine((n) => n <= PC_ABILITY_SCORE_MAX, {
  message: `Ability score must not exceed ${PC_ABILITY_SCORE_MAX}`,
})
