import { describe, expect, it } from 'vitest'

import { scoreItem } from '../../lib/search'

import {
  assembleComboboxOptionSearchDocument,
  optionMatchesQuery,
  type LabelValueDescriptionOption,
} from './option-query.lib'

const fireBoltOption: LabelValueDescriptionOption = {
  value: 'fire-bolt',
  label: 'Fire Bolt',
  description: 'Cantrip',
}

function legacyOptionMatchesQuery(option: LabelValueDescriptionOption, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [
    { text: option.label, weight: 1, role: 'label' as const },
    { text: option.value, weight: 1, role: 'alias' as const },
    ...(option.description
      ? [{ text: option.description, weight: 1, role: 'description' as const }]
      : []),
  ]

  return scoreItem({ fields }, normalized) > 0
}

describe('option-query.lib', () => {
  it('assembles combobox search documents with legacy role mapping', () => {
    expect(assembleComboboxOptionSearchDocument(fireBoltOption)).toEqual({
      id: 'fire-bolt',
      fields: [
        { key: 'label', text: 'Fire Bolt', role: 'primary' },
        { key: 'value', text: 'fire-bolt', role: 'keyword' },
        { key: 'description', text: 'Cantrip', role: 'secondary' },
      ],
    })
  })

  it('matches inclusion parity with legacy scoreItem for representative queries', () => {
    const queries = ['', 'bolt', 'fire-bolt', 'cantrip', 'ice', '  BOLT  ']

    for (const query of queries) {
      expect(optionMatchesQuery(fireBoltOption, query)).toBe(
        legacyOptionMatchesQuery(fireBoltOption, query),
      )
    }
  })
})
