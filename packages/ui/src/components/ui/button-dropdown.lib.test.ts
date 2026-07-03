import { describe, expect, it } from 'vitest'

import {
  buildButtonDropdownSearchFields,
  orderButtonDropdownItemsGrouped,
  rankButtonDropdownItems,
} from './button-dropdown.lib'

const groups = [
  { id: 'proficiencies', label: 'Proficiencies & training' },
  { id: 'combat-traits', label: 'Combat & traits' },
]

const items = [
  {
    id: 'skill-proficiency',
    label: 'Skill proficiency',
    description: 'Specific skills or a pool',
    groupId: 'proficiencies',
  },
  {
    id: 'movement-bonus',
    label: 'Movement bonus',
    description: 'Increase speed',
    groupId: 'combat-traits',
    searchTerms: [{ text: 'walk', weight: 1, role: 'keyword' as const }],
  },
]

describe('button-dropdown.lib', () => {
  it('orders grouped items by group definition', () => {
    expect(orderButtonDropdownItemsGrouped(items, groups).map((item) => item.id)).toEqual([
      'skill-proficiency',
      'movement-bonus',
    ])
  })

  it('ranks search results by score', () => {
    const ranked = rankButtonDropdownItems(items, groups, 'walk')
    expect(ranked.map((item) => item.id)).toEqual(['movement-bonus'])
  })

  it('includes group labels in search fields', () => {
    const fields = buildButtonDropdownSearchFields(
      items[0]!,
      new Map([['proficiencies', 'Proficiencies & training']]),
    )
    expect(
      fields.some((field) => field.text === 'Proficiencies & training' && field.role === 'group'),
    ).toBe(true)
  })
})
