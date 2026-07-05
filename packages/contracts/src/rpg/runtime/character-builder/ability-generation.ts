import { z } from 'zod'

import { ABILITY_IDS, type Ability } from '../../vocab/ability'

// ---------------------------------------------------------------------------
// Ability score generation — how a builder draft assigns the six scores.
// The method union stays open for 'point-buy' and 'rolled' later; MVP ships
// standard array (happy path) and manual entry (escape hatch).
// ---------------------------------------------------------------------------

/** SRD standard array — assign each value to exactly one ability. */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const

export const ABILITY_GENERATION_METHODS = ['standard-array', 'manual'] as const

export const abilityGenerationMethodSchema = z.enum(ABILITY_GENERATION_METHODS)

export type AbilityGenerationMethod = z.infer<typeof abilityGenerationMethodSchema>

/** Ability-generation slice of ResolvedCharacterCreationRules. */
export const abilityGenerationRulesSchema = z.object({
  methods: z.array(abilityGenerationMethodSchema).min(1),
  /** One value per ability; assignment order is the player's choice. */
  standardArray: z.array(z.number().int().min(1)).length(6),
})

export type AbilityGenerationRules = z.infer<typeof abilityGenerationRulesSchema>

export const DEFAULT_ABILITY_GENERATION_RULES = {
  methods: [...ABILITY_GENERATION_METHODS],
  standardArray: [...STANDARD_ARRAY],
} as const satisfies AbilityGenerationRules

const STANDARD_ARRAY_METHOD = 'standard-array' as const satisfies AbilityGenerationMethod

/**
 * Picks the ability-generation method the builder should use when the player
 * cannot choose. Prefers standard array when the rules allow it.
 */
export function resolveAbilityGenerationMethod(
  rules: AbilityGenerationRules,
): AbilityGenerationMethod {
  if (rules.methods.includes(STANDARD_ARRAY_METHOD)) {
    return STANDARD_ARRAY_METHOD
  }

  return rules.methods[0]!
}

/** Numeric scores currently assigned in ability order. */
export function getAssignedStandardArrayScores(scores: Partial<Record<Ability, number>>): number[] {
  return ABILITY_IDS.map((ability) => scores[ability]).filter(
    (score): score is number => typeof score === 'number',
  )
}

/** Count of abilities with a numeric score assigned. */
export function getAssignedScoreCount(scores: Partial<Record<Ability, number>>): number {
  return getAssignedStandardArrayScores(scores).length
}

/**
 * Values from `standardArray` not yet assigned. Each value appears at most once
 * in the result (multiset subtraction).
 */
export function getAvailableStandardArrayScores(
  scores: Partial<Record<Ability, number>>,
  standardArray: readonly number[],
): number[] {
  const available = [...standardArray]

  for (const ability of ABILITY_IDS) {
    const assigned = scores[ability]
    if (typeof assigned !== 'number') continue

    const index = available.indexOf(assigned)
    if (index !== -1) {
      available.splice(index, 1)
    }
  }

  return available.sort((left, right) => right - left)
}

/** Returns the ability that owns `score`, if any. */
export function findAbilityAssignedToScore(
  scores: Partial<Record<Ability, number>>,
  score: number,
  excludeAbility?: Ability,
): Ability | undefined {
  return ABILITY_IDS.find((ability) => ability !== excludeAbility && scores[ability] === score)
}

/**
 * Returns true when `scores` uses each value from `standardArray` exactly once.
 * Incomplete assignments return false.
 */
export function isStandardArrayAssignment(
  scores: Partial<Record<Ability, number>>,
  standardArray: readonly number[],
): boolean {
  const assigned = ABILITY_IDS.map((ability) => scores[ability]).filter(
    (score): score is number => typeof score === 'number',
  )

  if (assigned.length !== ABILITY_IDS.length) return false

  const sortedAssigned = [...assigned].sort((a, b) => a - b)
  const sortedExpected = [...standardArray].sort((a, b) => a - b)
  return sortedAssigned.every((value, index) => value === sortedExpected[index])
}
