import { describe, expect, expectTypeOf, it } from 'vitest'

import * as Form from './index'
import type { FieldChrome, FieldSize, FieldSurfaceVariant, FieldWidth } from './index'

const REQUIRED_PUBLIC_EXPORTS = [
  'FIELD_WIDTHS',
  'FIELD_SURFACE_VARIANTS',
  'DICE_FORMULA_TAIL_OPERATORS',
  'DICE_FORMULA_OPERATORS',
  'defineForm',
  'defineFormItems',
  'defineArrayField',
  'defineSelectField',
  'defineDependentField',
  'defineGroupField',
  'defineComboboxField',
  'defineDiceFormulaField',
  'defineInlineSentenceField',
  'Form',
  'makeResolver',
  'toOptions',
] as const

describe('@rpg/ui/form public exports', () => {
  it('exports authoring vocabularies and helpers', () => {
    for (const exportName of REQUIRED_PUBLIC_EXPORTS) {
      expect(Form).toHaveProperty(exportName)
    }
  })

  it('exports authoring types from the public entry', () => {
    expectTypeOf<FieldWidth>().toEqualTypeOf<(typeof Form.FIELD_WIDTHS)[number]>()
    expectTypeOf<FieldSize>().not.toBeAny()
    expectTypeOf<FieldChrome>().not.toBeAny()
    expectTypeOf<FieldSurfaceVariant>().toEqualTypeOf<
      (typeof Form.FIELD_SURFACE_VARIANTS)[number]
    >()
    expectTypeOf<import('./index').DiceFormulaTailOperator>().toEqualTypeOf<
      (typeof Form.DICE_FORMULA_TAIL_OPERATORS)[number]
    >()
  })
})
