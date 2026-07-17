import { describe, expect, expectTypeOf, it } from 'vitest'

import type {
  ArrayConfig,
  DiceFormulaFieldConfig,
  FormItem,
  SelectFieldConfig,
} from './field-config'
import {
  defineArrayField,
  defineComboboxField,
  defineDiceFormulaField,
  defineForm,
  defineFormItems,
  defineGroupField,
  defineInlineSentenceField,
  defineSelectField,
  defineDependentField,
} from './form-authoring'
import { DICE_FORMULA_OPERATORS } from '../components/ui/dice-formula-field.lib'

describe('form-authoring helpers', () => {
  it('returns the same object reference (identity)', () => {
    const array = defineArrayField({
      kind: 'array',
      name: 'items',
      legend: 'Items',
      fields: [],
    })
    expect(defineArrayField(array)).toBe(array)

    const fields = defineForm([{ type: 'text', name: 'title', label: 'Title' }])
    expect(defineForm(fields)).toBe(fields)

    const items = defineFormItems([{ type: 'text', name: 'title', label: 'Title' }])
    expect(defineFormItems(items)).toBe(items)
  })

  it('preserves array config literals for type narrowing', () => {
    const field = defineArrayField({
      kind: 'array',
      name: 'traits',
      legend: 'Traits',
      addAction: { label: 'Add trait' },
      min: 1,
      item: {
        surface: 'subtle',
        collapsible: true,
        header: {
          fallback: (index) => `Trait ${index + 1}`,
          primaryField: 'name',
        },
      },
      fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
    })

    expectTypeOf(field).toEqualTypeOf<typeof field>()
    expectTypeOf(field.kind).toEqualTypeOf<'array'>()
    expect(field.item?.surface).toBe('subtle')
    expectTypeOf(field).toMatchTypeOf<ArrayConfig>()
  })

  it('preserves nested array fields inside defineFormItems', () => {
    const section = defineFormItems([
      defineArrayField({
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        fields: [
          defineArrayField({
            kind: 'array',
            name: 'effects',
            legend: 'Effects',
            fields: [{ type: 'text', name: 'label', label: 'Label' }],
          }),
        ],
      }),
    ])

    expectTypeOf(section).toMatchTypeOf<readonly FormItem[]>()
    expect(section[0]?.kind).toBe('array')
    if (section[0]?.kind === 'array') {
      expect(section[0].fields[0]?.kind).toBe('array')
    }
  })

  it('preserves select and combobox discriminators', () => {
    const select = defineSelectField({
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [{ value: 'open', label: 'Open' }],
    })
    expectTypeOf(select.type).toEqualTypeOf<'select'>()
    expectTypeOf(select).toMatchTypeOf<SelectFieldConfig>()

    const combobox = defineComboboxField({
      type: 'combobox',
      name: 'tags',
      label: 'Tags',
      options: [],
      multiple: false,
    })
    expectTypeOf(combobox.multiple).toEqualTypeOf<false>()
  })

  it('preserves dice formula config literals', () => {
    const dice = defineDiceFormulaField({
      type: 'diceFormula',
      name: 'formula',
      label: 'Roll',
      modifierMode: 'required',
      modifierOperators: DICE_FORMULA_OPERATORS,
      faces: [6, 8, 10],
    })

    expectTypeOf(dice.type).toEqualTypeOf<'diceFormula'>()
    expectTypeOf(dice.modifierMode).toEqualTypeOf<'required'>()
    expectTypeOf(dice).toMatchTypeOf<DiceFormulaFieldConfig>()
  })

  it('assigns helper output to FormItem[] without friction', () => {
    const fields: FormItem[] = defineForm([
      defineGroupField({
        kind: 'group',
        legend: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name' }],
      }),
      defineDependentField({
        kind: 'dependent',
        controller: { type: 'switch', name: 'enabled', label: 'Enabled' },
        dependents: {
          fields: [{ type: 'text', name: 'value', label: 'Value' }],
        },
      }),
      defineInlineSentenceField({
        type: 'inlineSentence',
        name: 'speed',
        label: 'Speed',
        segments: [{ kind: 'text', value: 'Walk' }],
      }),
    ])

    expect(fields).toHaveLength(3)
  })
})
