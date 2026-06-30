import { describe, expect, it } from 'vitest'

import {
  averageTierBonusGold,
  currencyDiceFormulaSchema,
  formatCurrencyDiceFormula,
  formatTierBonusGold,
  tierBonusGoldSchema,
} from './currency-formula'

describe('currencyDiceFormulaSchema', () => {
  it('extends scaled dice with a currency denomination', () => {
    expect(
      currencyDiceFormulaSchema.parse({
        kind: 'dice',
        dice: { count: 1, faces: 10 },
        multiplier: 250,
        currency: 'gp',
      }),
    ).toEqual({
      kind: 'dice',
      dice: { count: 1, faces: 10 },
      multiplier: 250,
      currency: 'gp',
    })
  })

  it('formats with the currency suffix', () => {
    const formula = currencyDiceFormulaSchema.parse({
      kind: 'dice',
      dice: { count: 1, faces: 10 },
      multiplier: 250,
      currency: 'gp',
    })

    expect(formatCurrencyDiceFormula(formula)).toBe('1d10 × 250 GP')
  })
})

describe('tierBonusGoldSchema', () => {
  it('combines a fixed base with a currency dice formula', () => {
    const bonus = tierBonusGoldSchema.parse({
      baseGp: 5000,
      formula: {
        kind: 'dice',
        dice: { count: 1, faces: 10 },
        multiplier: 250,
        currency: 'gp',
      },
    })

    expect(formatTierBonusGold(bonus)).toBe('5,000 GP + 1d10 × 250 GP')
    expect(averageTierBonusGold(bonus)).toBe(6375)
  })
})
