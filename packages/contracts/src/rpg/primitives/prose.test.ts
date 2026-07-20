import { describe, expect, it } from 'vitest'

import { joinNaturalList } from './prose'

describe('joinNaturalList', () => {
  it('returns an empty string for no items', () => {
    expect(joinNaturalList([])).toBe('')
  })

  it('returns the sole item unchanged', () => {
    expect(joinNaturalList(['Leather Armor'])).toBe('Leather Armor')
  })

  it('joins two items with and', () => {
    expect(joinNaturalList(['Dagger', 'Spellbook'])).toBe('Dagger and Spellbook')
  })

  it('joins three or more items with an Oxford comma', () => {
    expect(joinNaturalList(['Dagger', 'Robe', 'Spellbook'])).toBe('Dagger, Robe, and Spellbook')
  })
})
