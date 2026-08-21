import { describe, expect, it } from 'vitest'

import { ORGANIZATION_PRACTICE_IDS } from '@rpg/contracts'

import { rankOrganizationPracticeComboboxOptions } from './organization-practice-combobox-ranking'

const practiceOptions = ORGANIZATION_PRACTICE_IDS.map((id) => ({
  value: id,
  label: id,
}))

describe('rankOrganizationPracticeComboboxOptions', () => {
  it('boosts recommended practices after selected values on an empty query', () => {
    const ranked = rankOrganizationPracticeComboboxOptions(
      practiceOptions,
      '',
      ['theft'],
      ['fencing', 'extortion', 'smuggling', 'investigation'],
    )

    expect(ranked.slice(0, 5).map((option) => option.value)).toEqual([
      'theft',
      'fencing',
      'extortion',
      'smuggling',
      'investigation',
    ])
  })

  it('skips recommended practices that are already selected', () => {
    const ranked = rankOrganizationPracticeComboboxOptions(
      practiceOptions,
      '',
      ['theft', 'fencing'],
      ['fencing', 'extortion', 'smuggling'],
    )

    expect(ranked.slice(0, 4).map((option) => option.value)).toEqual([
      'theft',
      'fencing',
      'extortion',
      'smuggling',
    ])
  })

  it('uses rankOptionsByQuery only for typed search', () => {
    const ranked = rankOrganizationPracticeComboboxOptions(
      practiceOptions,
      'cart',
      [],
      ['fencing', 'extortion', 'smuggling', 'investigation'],
    )

    expect(ranked[0]?.value).toBe('cartography')
    expect(ranked.some((option) => option.value === 'fencing')).toBe(false)
  })

  it('keeps selected values visible when they do not match the typed query', () => {
    const ranked = rankOrganizationPracticeComboboxOptions(
      practiceOptions,
      'cart',
      ['theft'],
      ['fencing', 'extortion'],
    )

    expect(ranked[0]?.value).toBe('theft')
    expect(ranked[1]?.value).toBe('cartography')
  })
})
