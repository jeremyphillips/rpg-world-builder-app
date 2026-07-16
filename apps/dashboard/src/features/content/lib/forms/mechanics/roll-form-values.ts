import { dieFaceSchema, rollSchema, type RollValue } from '@rpg/contracts'
import { z } from 'zod'

export const ROLL_FLAT_OPERATORS = ['+', '-'] as const

export type RollFlatOperator = (typeof ROLL_FLAT_OPERATORS)[number]

/** Zod schema for in-progress roll objects in equipment and spell effect forms. */
export const rollFormObjectSchema = z.object({
  dice: z
    .object({
      count: z.coerce.number().int().min(1).optional(),
      faces: dieFaceSchema.optional(),
    })
    .optional(),
  flatOperator: z.enum(ROLL_FLAT_OPERATORS).optional(),
  flatAmount: z.coerce.number().int().min(0).optional(),
})

/** Permissive in-progress RollValue shape bound by roll form atoms. */
export type RollFormShape = z.infer<typeof rollFormObjectSchema> & {
  /** Contract passthrough when rows are copied before split (normalized via join/split). */
  flat?: number
}

const EMPTY_NUMBER_SENTINEL = '' as unknown as number

export function isRollFlatAmountPresent(amount: unknown): boolean {
  return (
    amount !== undefined && amount !== null && amount !== EMPTY_NUMBER_SENTINEL && amount !== ''
  )
}

/** Splits signed contract `flat` into form-only operator + unsigned amount. */
export function splitSignedRollFlat(flat: number | undefined): {
  flatOperator: RollFlatOperator
  flatAmount?: number
} {
  if (flat === undefined) {
    return { flatOperator: '+' }
  }

  return {
    flatOperator: flat >= 0 ? '+' : '-',
    flatAmount: Math.abs(flat),
  }
}

/** Joins form operator + unsigned amount into signed contract `flat`. */
export function joinSignedRollFlat(
  operator: RollFlatOperator | undefined,
  amount: number | undefined,
): number | undefined {
  if (!isRollFlatAmountPresent(amount)) return undefined

  const magnitude = Math.abs(Number(amount))
  if (magnitude === 0) return undefined

  return operator === '-' ? -magnitude : magnitude
}

function resolveFormFlat(roll: RollFormShape): number | undefined {
  const fromParts = joinSignedRollFlat(roll.flatOperator, roll.flatAmount)
  if (fromParts !== undefined) return fromParts

  if (roll.flat !== undefined && roll.flat !== EMPTY_NUMBER_SENTINEL) {
    return roll.flat
  }

  return undefined
}

/** Normalizes form roll paths to contract `RollValue`. */
export function normalizeRollFormValue(roll: RollFormShape | undefined): RollValue | undefined {
  if (!roll) return undefined

  const normalized: RollValue = {}
  const count = roll.dice?.count
  const faces = roll.dice?.faces

  if (count !== undefined && faces !== undefined) {
    const parsedFaces = dieFaceSchema.safeParse(faces)
    if (parsedFaces.success) {
      normalized.dice = { count, faces: parsedFaces.data }
    }
  }

  const flat = resolveFormFlat(roll)
  if (flat !== undefined) {
    normalized.flat = flat
  }

  const parsed = rollSchema.safeParse(normalized)
  return parsed.success ? parsed.data : undefined
}

/** Maps contract roll to form field shape for entity → form round-trips. */
export function rollToFormShape(roll: RollValue | undefined): RollFormShape | undefined {
  if (!roll) return undefined

  const { flatOperator, flatAmount } = splitSignedRollFlat(roll.flat)

  return {
    ...(roll.dice ? { dice: { count: roll.dice.count, faces: roll.dice.faces } } : {}),
    ...(roll.flat !== undefined ? { flatOperator, flatAmount } : {}),
  }
}
