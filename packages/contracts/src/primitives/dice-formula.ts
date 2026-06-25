import { z } from 'zod'

import { averageDiceRoll, diceSchema, formatDice, type Dice } from './dice'

// ---------------------------------------------------------------------------
// Scaled dice formula — currency-agnostic roll expression (count × faces × multiplier).
// Wrap with currency for gold grants; reuse elsewhere for loot tables, etc.
// ---------------------------------------------------------------------------

export const SCALED_DICE_FORMULA_KINDS = ['dice'] as const

export const scaledDiceFormulaKindSchema = z.enum(SCALED_DICE_FORMULA_KINDS)

export type ScaledDiceFormulaKind = z.infer<typeof scaledDiceFormulaKindSchema>

export const scaledDiceFormulaSchema = z.object({
  kind: scaledDiceFormulaKindSchema,
  dice: diceSchema,
  multiplier: z.number().int().min(1),
})

export type ScaledDiceFormula = z.infer<typeof scaledDiceFormulaSchema>

/** Formats a scaled dice formula (e.g. "1d10 × 250"). */
export function formatScaledDiceFormula(formula: ScaledDiceFormula): string {
  return `${formatDice(formula.dice)} × ${formula.multiplier}`
}

/** Returns the average result of a scaled dice formula. */
export function averageScaledDiceRoll(
  formula: Pick<ScaledDiceFormula, 'dice' | 'multiplier'>,
): number {
  return averageDiceRoll(formula.dice) * formula.multiplier
}

/** Convenience helper when only dice + multiplier are needed without the kind wrapper. */
export function scaledDiceRollAverage(dice: Dice, multiplier: number): number {
  return averageDiceRoll(dice) * multiplier
}
