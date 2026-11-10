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
    metadata: 'Specific skills or a pool',
    groupId: 'proficiencies',
  },
  {
    id: 'movement-bonus',
    label: 'Movement bonus',
    metadata: 'Increase speed',
    groupId: 'combat-traits',
    searchTerms: ['walk'],
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

  it('matches multi-word queries against grant-style labels', () => {
    const weaponItem = {
      id: 'weapon-proficiency',
      label: 'Weapon proficiency',
      metadata: 'Grant proficiency with specific weapons, a weapon category, or a player choice.',
      groupId: 'proficiencies',
      searchTerms: ['proficiency'],
      search: { includeSupporting: true as const },
    }

    expect(
      rankButtonDropdownItems([weaponItem], groups, 'weapon proficiency').map((item) => item.id),
    ).toEqual(['weapon-proficiency'])
  })

  it('excludes metadata from search when search.includeSupporting is false', () => {
    const withMetadataOnly = {
      id: 'hold-breath',
      label: 'Hold Breath',
      metadata: 'Holds its breath for a set time.',
      search: { includeSupporting: false as const },
    }
    const fields = buildButtonDropdownSearchFields(withMetadataOnly, new Map())
    expect(fields.some((field) => field.role === 'description')).toBe(false)

    const withKeyword = {
      ...withMetadataOnly,
      searchTerms: ['suffocate'],
    }
    expect(rankButtonDropdownItems([withKeyword], [], 'suffocate')).toHaveLength(1)
    expect(rankButtonDropdownItems([withMetadataOnly], [], 'set time')).toHaveLength(0)
  })
})
