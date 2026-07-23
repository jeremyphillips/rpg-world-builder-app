import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  DEFAULT_DEPENDENT_SURFACE,
  resolveFieldContainerChromeClasses,
} from '../components/ui/field-surface.variants'
import {
  FIELD_WIDTHS,
  fieldWidthVariants,
  type FieldWidth,
} from '../components/ui/field-control.variants'
import { DICE_FORMULA_TAIL_OPERATORS } from '../components/ui/dice-formula-field.lib'

describe('form field vocabulary parity', () => {
  it('FIELD_WIDTHS entries are accepted by fieldWidthVariants', () => {
    for (const width of FIELD_WIDTHS) {
      expect(fieldWidthVariants({ width })).toBeTypeOf('string')
    }
  })

  it('FieldWidth matches FIELD_WIDTHS union', () => {
    expectTypeOf<FieldWidth>().toEqualTypeOf<(typeof FIELD_WIDTHS)[number]>()
  })

  it('DEFAULT_DEPENDENT_SURFACE resolves through container chrome helper', () => {
    expect(resolveFieldContainerChromeClasses({ surface: DEFAULT_DEPENDENT_SURFACE })).toBeTypeOf(
      'string',
    )
  })

  it('DICE_FORMULA_TAIL_OPERATORS is a non-empty closed set', () => {
    expect(DICE_FORMULA_TAIL_OPERATORS).toEqual(['+', '-', '×', '÷'])
  })
})
