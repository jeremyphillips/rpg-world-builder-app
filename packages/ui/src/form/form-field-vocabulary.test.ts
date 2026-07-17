import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  FIELD_SURFACE_TONES,
  fieldSurfaceToneVariants,
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

  it('FIELD_SURFACE_TONES entries are accepted by fieldSurfaceToneVariants', () => {
    for (const tone of FIELD_SURFACE_TONES) {
      expect(fieldSurfaceToneVariants({ tone })).toBeTypeOf('string')
    }
  })

  it('DICE_FORMULA_TAIL_OPERATORS is a non-empty closed set', () => {
    expect(DICE_FORMULA_TAIL_OPERATORS).toEqual(['+', '-', '×', '÷'])
  })
})
