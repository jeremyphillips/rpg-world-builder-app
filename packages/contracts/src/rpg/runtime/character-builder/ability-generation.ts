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
