import { describe, expect, it } from 'vitest'

import * as Form from './index'

const REQUIRED_PUBLIC_EXPORTS = [
  'FIELD_WIDTHS',
  'FIELD_SURFACE_TONES',
  'DICE_FORMULA_TAIL_OPERATORS',
  'DICE_FORMULA_OPERATORS',
  'defineForm',
  'defineFormItems',
  'defineArrayField',
  'defineSelectField',
  'defineStackField',
  'defineGroupField',
  'defineComboboxField',
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
})
