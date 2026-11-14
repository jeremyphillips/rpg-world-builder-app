import { describe, expect, it } from 'vitest'

import { formatCardinalWord, joinNaturalList } from './prose'

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

  it('joins with or when requested', () => {
    expect(joinNaturalList(['Claw', 'Tail'], { conjunction: 'or' })).toBe('Claw or Tail')
    expect(joinNaturalList(['Bite', 'Claw', 'Tail'], { conjunction: 'or' })).toBe(
      'Bite, Claw, or Tail',
    )
  })
})

describe('formatCardinalWord', () => {
  it('renders 0–10 as English words', () => {
    expect(formatCardinalWord(0)).toBe('zero')
    expect(formatCardinalWord(1)).toBe('one')
    expect(formatCardinalWord(2)).toBe('two')
    expect(formatCardinalWord(10)).toBe('ten')
  })

  it('falls back to decimal digits above ten', () => {
    expect(formatCardinalWord(11)).toBe('11')
    expect(formatCardinalWord(99)).toBe('99')
  })
})
