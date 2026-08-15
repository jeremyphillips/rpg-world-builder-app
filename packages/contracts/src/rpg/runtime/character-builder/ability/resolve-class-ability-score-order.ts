import { abilityScoreOrderSchema, type AbilityScoreOrder } from '../../../primitives/standard-array'
import type { Ability } from '../../../vocab/ability'

import { deriveAbilityAssignmentPriority } from './ability-score-recommendations'

// ---------------------------------------------------------------------------
// Class ability score order — migration policy for legacy classes missing an
// explicit Standard Array assignment order. Not a Standard Array primitive.
// ---------------------------------------------------------------------------

export type ResolveClassAbilityScoreOrderInput = {
  abilityScoreOrder?: readonly Ability[] | undefined
  primaryAbilities: readonly Ability[]
}

/**
 * Resolves the ability order a class uses for Standard Array assignment.
 * Missing order falls back to legacy primary-ability priority; present but
 * invalid order throws via schema parse (corrupted content is not repaired).
 */
export function resolveClassAbilityScoreOrder(
  input: ResolveClassAbilityScoreOrderInput,
): AbilityScoreOrder {
  if (input.abilityScoreOrder === undefined) {
    return abilityScoreOrderSchema.parse(deriveAbilityAssignmentPriority(input.primaryAbilities))
  }

  return abilityScoreOrderSchema.parse(input.abilityScoreOrder)
}
