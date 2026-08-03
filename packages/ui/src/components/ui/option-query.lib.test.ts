import { describe, expect, it } from 'vitest'

import { scoreItem } from '../../lib/search'

import {
  assembleComboboxOptionSearchDocument,
  optionMatchesQuery,
  rankOptionsByQuery,
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

  it('matches separator-insensitive queries with the forgiving profile', () => {
    expect(optionMatchesQuery(fireBoltOption, 'firebolt')).toBe(true)
    expect(optionMatchesQuery(fireBoltOption, 'fire ball')).toBe(false)
  })

  it('matches fire ball to fireball labels', () => {
    const fireballOption: LabelValueDescriptionOption = {
      value: 'fireball',
      label: 'Fireball',
    }

    expect(optionMatchesQuery(fireballOption, 'fire ball')).toBe(true)
    expect(optionMatchesQuery(fireballOption, 'fireball')).toBe(true)
  })

  it('assembles keyword fields from searchTerms', () => {
    const option: LabelValueDescriptionOption = {
      value: 'stable',
      label: 'Stable',
      searchTerms: ['horses', 'lodging'],
    }

    expect(assembleComboboxOptionSearchDocument(option)).toEqual({
      id: 'stable',
      fields: [
        { key: 'label', text: 'Stable', role: 'primary' },
        { key: 'value', text: 'stable', role: 'keyword' },
        { key: 'searchTerm-0', text: 'horses', role: 'keyword' },
        { key: 'searchTerm-1', text: 'lodging', role: 'keyword' },
      ],
    })
  })

  it('matches composed searchTerms with the forgiving profile', () => {
    const option: LabelValueDescriptionOption = {
      value: 'stable',
      label: 'Stable',
      searchTerms: ['horses'],
    }

    expect(optionMatchesQuery(option, 'horses')).toBe(true)
    expect(optionMatchesQuery(option, 'cow')).toBe(false)
  })

  it('ranks label exact match above search-term-only match', () => {
    const libraryOption: LabelValueDescriptionOption = {
      value: 'library',
      label: 'Library',
    }
    const archiveOption: LabelValueDescriptionOption = {
      value: 'archive',
      label: 'Archive',
      searchTerms: ['library'],
    }

    expect(
      rankOptionsByQuery([archiveOption, libraryOption], 'library').map((option) => option.value),
    ).toEqual(['library', 'archive'])
  })
})
