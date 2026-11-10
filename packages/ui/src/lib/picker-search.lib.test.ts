import { describe, expect, it } from 'vitest'

import {
  buildPickerSearchFields,
  mapPickerFieldsToLegacyWeighted,
  mapPickerFieldsToSearchDocument,
  resolveIncludeSupportingForCombobox,
  resolveIncludeSupportingForDropdown,
} from './picker-search.lib'

describe('picker-search.lib', () => {
  it('excludes supporting text when includeSupporting is false', () => {
    const fields = buildPickerSearchFields({
      label: 'Flyby',
      supportingText: 'Flying creature',
      includeSupporting: false,
      searchTerms: ['flying'],
    })
    expect(fields.map((field) => field.legacyRole)).not.toContain('description')
    expect(fields.some((field) => field.text === 'flying')).toBe(true)
  })

  it('includes supporting text for combobox transitional default when metadata exists', () => {
    expect(resolveIncludeSupportingForCombobox(undefined, true)).toBe(true)
    expect(resolveIncludeSupportingForCombobox(undefined, false)).toBe(false)
    expect(resolveIncludeSupportingForCombobox({ includeSupporting: false }, true)).toBe(false)
  })

  it('defaults dropdown to indexing supporting when search is omitted', () => {
    expect(resolveIncludeSupportingForDropdown(undefined)).toBe(true)
    expect(resolveIncludeSupportingForDropdown({ includeSupporting: false })).toBe(false)
  })

  it('maps label exact rank above keyword-only terms via legacy weights', () => {
    const fields = buildPickerSearchFields({
      label: 'Library',
      includeSupporting: false,
      searchTerms: ['library'],
    })
    const weighted = mapPickerFieldsToLegacyWeighted(fields)
    expect(weighted).toEqual(
      expect.arrayContaining([
        { text: 'Library', weight: 1, role: 'label' },
        { text: 'library', weight: 1, role: 'keyword' },
      ]),
    )
  })

  it('assembles combobox search documents with value slug and metadata', () => {
    const fields = buildPickerSearchFields({
      label: 'Fire Bolt',
      supportingText: 'Cantrip',
      includeSupporting: true,
      valueSlug: 'fire-bolt',
    })
    expect(mapPickerFieldsToSearchDocument('fire-bolt', fields)).toEqual({
      id: 'fire-bolt',
      fields: [
        { key: 'label', text: 'Fire Bolt', role: 'primary' },
        { key: 'value', text: 'fire-bolt', role: 'keyword' },
        { key: 'metadata', text: 'Cantrip', role: 'secondary' },
      ],
    })
  })
})
