import { z } from 'zod'

import {
  ABILITY_IDS,
  abilitySchema,
  characterAbilityScoreSchema,
  type Ability,
} from '../vocab/ability'

import { standardArrayValidationMessages } from './standard-array-messages'

// ---------------------------------------------------------------------------
// Standard Array — canonical six-value score pool and class assignment order.
// Pure primitives only; class migration policy lives in the builder layer.
// ---------------------------------------------------------------------------

export const STANDARD_ARRAY_LENGTH = 6 as const

/** SRD default Standard Array — ranked score slots, not tied to abilities. */
export const DEFAULT_STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const satisfies readonly number[]

export const standardArraySchema = z
  .array(characterAbilityScoreSchema)
  .length(STANDARD_ARRAY_LENGTH, {
    message: standardArrayValidationMessages.wrongLength(),
  })

export const abilityScoreOrderSchema = z
  .array(abilitySchema)
  .length(STANDARD_ARRAY_LENGTH, {
    message: standardArrayValidationMessages.incompleteClassOrder(),
  })
  .superRefine((order, ctx) => {
    const seen = new Set<Ability>()

    for (const ability of order) {
      if (seen.has(ability)) {
        ctx.addIssue({
          code: 'custom',
          message: standardArrayValidationMessages.incompleteClassOrder(),
        })
        return
      }
      seen.add(ability)
    }

    for (const ability of ABILITY_IDS) {
      if (!seen.has(ability)) {
        ctx.addIssue({
          code: 'custom',
          message: standardArrayValidationMessages.incompleteClassOrder(),
        })
        return
      }
    }
  })

export type StandardArray = z.infer<typeof standardArraySchema>

export type AbilityScoreOrder = z.infer<typeof abilityScoreOrderSchema>

/** Maps ranked Standard Array slots onto a class ability order by position. */
export function resolveStandardArrayAssignment(args: {
  standardArray: readonly number[]
  abilityScoreOrder: readonly Ability[]
}): Partial<Record<Ability, number>> {
  const assignment: Partial<Record<Ability, number>> = {}
  const pairCount = Math.min(args.standardArray.length, args.abilityScoreOrder.length)

  for (let index = 0; index < pairCount; index += 1) {
    const ability = args.abilityScoreOrder[index]
    const score = args.standardArray[index]
    if (ability !== undefined && score !== undefined) {
      assignment[ability] = score
    }
  }

  return assignment
}
