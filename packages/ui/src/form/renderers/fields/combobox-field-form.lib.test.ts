import { describe, expect, it } from 'vitest'

import { COMBOBOX_FILTER_ALL_VALUE } from '../../field-config'
import {
  composeComboboxResolveFilteredOptions,
  filterComboboxOptionsByCategory,
  toComboboxFieldOptions,
} from './combobox-field-form.lib'

const toolOptions = [
  {
    value: 'thieves-tools',
    label: "Thieves' tools",
    filterCategory: 'thieves',
    classification: "Thieves' tools",
  },
  {
    value: 'lute',
    label: 'Lute',
    filterCategory: 'musical_instrument',
    classification: 'Musical instrument',
  },
]

describe('filterComboboxOptionsByCategory', () => {
  it('returns all options when the filter is "all"', () => {
    expect(
      filterComboboxOptionsByCategory(
        toComboboxFieldOptions(toolOptions),
        COMBOBOX_FILTER_ALL_VALUE,
        [],
      ),
    ).toEqual(toComboboxFieldOptions(toolOptions))
  })

  it('keeps selected values visible when they fall outside the active category', () => {
    expect(
      filterComboboxOptionsByCategory(toComboboxFieldOptions(toolOptions), 'thieves', ['lute']),
    ).toEqual([toComboboxFieldOptions(toolOptions)[0], toComboboxFieldOptions(toolOptions)[1]])
  })

  it('filters unselected options by category slug', () => {
    expect(
      filterComboboxOptionsByCategory(toComboboxFieldOptions(toolOptions), 'thieves', []),
    ).toEqual([toComboboxFieldOptions(toolOptions)[0]])
  })
})

describe('composeComboboxResolveFilteredOptions', () => {
  it('applies category filtering before the default query filter', () => {
    const resolver = composeComboboxResolveFilteredOptions('thieves', undefined)!
    expect(resolver(toolOptions, 'lute', [])).toEqual([])
    expect(resolver(toolOptions, 'thieves', [])).toEqual([toolOptions[0]])
  })
})
