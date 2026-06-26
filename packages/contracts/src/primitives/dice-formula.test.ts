import { describe, expect, it } from 'vitest'

import {
  averageScaledDiceRoll,
  formatScaledDiceFormula,
  scaledDiceFormulaSchema,
} from './dice-formula'

describe('scaledDiceFormulaSchema', () => {
  it('accepts a structured dice multiplier formula', () => {
    const formula = scaledDiceFormulaSchema.parse({
      kind: 'dice',
      dice: { count: 1, faces: 10 },
      multiplier: 250,
    })

    expect(formula).toEqual({
      kind: 'dice',
      dice: { count: 1, faces: 10 },
      multiplier: 250,
    })
  })

  it('formats and averages roll expressions', () => {
    const formula = scaledDiceFormulaSchema.parse({
      kind: 'dice',
      dice: { count: 1, faces: 10 },
      multiplier: 25,
    })

    expect(formatScaledDiceFormula(formula)).toBe('1d10 × 25')
    expect(averageScaledDiceRoll(formula)).toBe(137.5)
  })
})
