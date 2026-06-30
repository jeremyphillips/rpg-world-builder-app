import { z } from 'zod'

import {
  averageScaledDiceRoll,
  formatScaledDiceFormula,
  scaledDiceFormulaSchema,
} from './dice-formula'
import { currencySchema, formatMoney, moneyToCp, type Currency } from './units'

// ---------------------------------------------------------------------------
// Currency dice formula — scaled dice roll denominated in a coin type.
// ---------------------------------------------------------------------------

export const currencyDiceFormulaSchema = scaledDiceFormulaSchema.extend({
  currency: currencySchema,
})

export type CurrencyDiceFormula = z.infer<typeof currencyDiceFormulaSchema>

/** Formats a currency dice formula with its denomination (e.g. "1d10 × 250 GP"). */
export function formatCurrencyDiceFormula(formula: CurrencyDiceFormula): string {
  const currencyLabel = formula.currency.toUpperCase()
  return `${formatScaledDiceFormula(formula)} ${currencyLabel}`
}

/** Returns the average roll value in the formula's currency denomination. */
export function averageCurrencyDiceRoll(formula: CurrencyDiceFormula): number {
  return averageScaledDiceRoll(formula)
}

export const tierBonusGoldSchema = z.object({
  baseGp: z.number().int().min(0),
  formula: currencyDiceFormulaSchema,
})

export type TierBonusGold = z.infer<typeof tierBonusGoldSchema>

/** Total average bonus gold: fixed base plus the average of the dice formula (converted to GP). */
export function averageTierBonusGold(bonus: TierBonusGold): number {
  const rollAverage = averageCurrencyDiceRoll(bonus.formula)
  const rollGp =
    bonus.formula.currency === 'gp'
      ? rollAverage
      : moneyToCp({ amount: rollAverage, currency: bonus.formula.currency }) / 100
  return bonus.baseGp + rollGp
}

/** Formats tier bonus gold for display (e.g. "5,000 GP + 1d10 × 250 GP"). */
export function formatTierBonusGold(bonus: TierBonusGold): string {
  const base = formatMoney({ amount: bonus.baseGp, currency: 'gp' as Currency })
  return `${base} + ${formatCurrencyDiceFormula(bonus.formula)}`
}
