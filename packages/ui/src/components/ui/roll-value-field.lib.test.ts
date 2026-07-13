import { describe, expect, it } from 'vitest'

import {
  applyRollValueFieldPatch,
  defaultRollValueModifier,
  isRollFlatAmountPresent,
  joinSignedRollFlat,
  resolveRollValueFieldDefaults,
  rollValuePartsHaveDice,
  rollValuePartsHaveFlat,
  rollValuePartsToDiceFormula,
  shouldShowRollValueDiceFields,
  shouldShowRollValueModifierFields,
  splitSignedRollFlat,
} from './roll-value-field.lib'

const FACES = [4, 6, 8, 10, 12, 20] as const
const DEFAULTS = { count: 1, faces: 6 }

describe('roll-value-field.lib', () => {
  it('splits and joins signed flat values', () => {
    expect(splitSignedRollFlat(4)).toEqual({ flatOperator: '+', flatAmount: 4 })
    expect(splitSignedRollFlat(-1)).toEqual({ flatOperator: '-', flatAmount: 1 })
    expect(splitSignedRollFlat(undefined)).toEqual({ flatOperator: '+' })
    expect(joinSignedRollFlat('+', 4)).toBe(4)
    expect(joinSignedRollFlat('-', 1)).toBe(-1)
    expect(joinSignedRollFlat('+', 0)).toBeUndefined()
  })

  it('detects dice, flat, and visibility states', () => {
    expect(rollValuePartsHaveDice({ diceCount: 1, diceFaces: 6 })).toBe(true)
    expect(rollValuePartsHaveDice({ diceCount: 1 })).toBe(false)
    expect(rollValuePartsHaveFlat({ flatAmount: 0 })).toBe(true)
    expect(shouldShowRollValueDiceFields({ diceCount: 1, diceFaces: 6 })).toBe(true)
    expect(shouldShowRollValueDiceFields({ flatAmount: 1 })).toBe(false)
    expect(shouldShowRollValueModifierFields({ flatAmount: 2 })).toBe(true)
    expect(shouldShowRollValueModifierFields({ diceCount: 1, diceFaces: 6 })).toBe(false)
  })

  it('maps roll parts to dice formula values', () => {
    expect(rollValuePartsToDiceFormula({ diceCount: 1, diceFaces: 12 }, DEFAULTS)).toEqual({
      count: 1,
      faces: 12,
    })
    expect(
      rollValuePartsToDiceFormula(
        { diceCount: 2, diceFaces: 4, flatOperator: '+', flatAmount: 4 },
        DEFAULTS,
      ),
    ).toEqual({
      count: 2,
      faces: 4,
      modifier: { operator: '+', amount: 4 },
    })
    expect(rollValuePartsToDiceFormula({ flatOperator: '+', flatAmount: 1 }, DEFAULTS)).toEqual({
      count: 1,
      faces: 6,
      modifier: { operator: '+', amount: 1 },
    })
  })

  it('applies dice and modifier patches', () => {
    expect(
      applyRollValueFieldPatch({ diceCount: 1, diceFaces: 6 }, { faces: 12 }, DEFAULTS),
    ).toEqual({ diceCount: 1, diceFaces: 12 })
    expect(applyRollValueFieldPatch({}, { clearModifier: true }, DEFAULTS)).toEqual({
      clearFlat: true,
    })
    expect(defaultRollValueModifier()).toEqual({ flatOperator: '+', flatAmount: 0 })
    expect(isRollFlatAmountPresent(0)).toBe(true)
    expect(resolveRollValueFieldDefaults({ faces: 99 }, FACES)).toEqual({ count: 1, faces: 4 })
  })
})
