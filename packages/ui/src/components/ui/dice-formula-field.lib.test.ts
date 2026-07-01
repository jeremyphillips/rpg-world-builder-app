import { describe, expect, it } from 'vitest'

import {
  applyDiceFormulaPatch,
  DEFAULT_DICE_FORMULA_VALUE,
  DEFAULT_DICE_FORMULA_WITH_MODIFIER,
  defaultDiceFormulaForMode,
  formatDiceFormula,
  resolveDiceFormulaValue,
  shouldShowModifierFields,
} from './dice-formula-field.lib'

describe('formatDiceFormula', () => {
  it('formats dice without modifier', () => {
    expect(formatDiceFormula({ count: 1, faces: 8 })).toBe('1d8')
  })

  it('formats dice with positive modifier', () => {
    expect(formatDiceFormula({ count: 2, faces: 6, modifier: { operator: '+', amount: 3 } })).toBe(
      '2d6+3',
    )
  })

  it('formats dice with negative modifier', () => {
    expect(formatDiceFormula({ count: 1, faces: 4, modifier: { operator: '-', amount: 1 } })).toBe(
      '1d4-1',
    )
  })

  it('formats dice with multiply operator using spaced notation', () => {
    expect(
      formatDiceFormula({ count: 1, faces: 10, modifier: { operator: '×', amount: 250 } }),
    ).toBe('1d10 × 250')
  })
})

describe('defaultDiceFormulaForMode', () => {
  it('returns 1d6 for none and optional', () => {
    expect(defaultDiceFormulaForMode('none')).toEqual(DEFAULT_DICE_FORMULA_VALUE)
    expect(defaultDiceFormulaForMode('optional')).toEqual(DEFAULT_DICE_FORMULA_VALUE)
  })

  it('uses the configured default operator for required mode', () => {
    expect(defaultDiceFormulaForMode('required', ['×'])).toEqual({
      count: 1,
      faces: 6,
      modifier: { operator: '×', amount: 1 },
    })
  })
})

describe('applyDiceFormulaPatch', () => {
  it('clears optional modifiers when requested', () => {
    expect(
      applyDiceFormulaPatch(
        { count: 1, faces: 6, modifier: { operator: '+', amount: 2 } },
        { clearModifier: true },
        'optional',
      ),
    ).toEqual({ count: 1, faces: 6 })
  })

  it('keeps a required modifier when clearing', () => {
    expect(
      applyDiceFormulaPatch(
        { count: 1, faces: 6, modifier: { operator: '-', amount: 2 } },
        { clearModifier: true },
        'required',
      ),
    ).toEqual({ count: 1, faces: 6, modifier: { operator: '+', amount: 1 } })
  })
})

describe('shouldShowModifierFields', () => {
  it('shows modifier fields for required mode', () => {
    expect(shouldShowModifierFields('required', DEFAULT_DICE_FORMULA_VALUE)).toBe(true)
  })

  it('hides optional modifier fields until a modifier exists', () => {
    expect(shouldShowModifierFields('optional', DEFAULT_DICE_FORMULA_VALUE)).toBe(false)
    expect(shouldShowModifierFields('optional', DEFAULT_DICE_FORMULA_WITH_MODIFIER)).toBe(true)
  })
})

describe('resolveDiceFormulaValue', () => {
  it('falls back to the first allowed face when the value face is invalid', () => {
    expect(resolveDiceFormulaValue({ count: 2, faces: 99 }, 'none', [6, 8])).toEqual({
      count: 2,
      faces: 6,
    })
  })

  it('preserves optional modifiers when present', () => {
    expect(
      resolveDiceFormulaValue(
        { count: 2, faces: 6, modifier: { operator: '+', amount: 2 } },
        'optional',
        [6, 8],
      ),
    ).toEqual({ count: 2, faces: 6, modifier: { operator: '+', amount: 2 } })
  })

  it('adds a modifier for required mode when missing', () => {
    expect(resolveDiceFormulaValue({ count: 1, faces: 6 }, 'required', [6, 8])).toEqual({
      count: 1,
      faces: 6,
      modifier: { operator: '+', amount: 1 },
    })
  })
})
