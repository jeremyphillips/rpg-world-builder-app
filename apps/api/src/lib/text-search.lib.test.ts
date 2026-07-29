import { describe, expect, it } from 'vitest'

import { matchesAnyTextSearchQuery, matchesTextSearchQuery } from './text-search.lib'

describe('text-search.lib', () => {
  it('matches forgiving separator variants', () => {
    expect(matchesTextSearchQuery('Fire Bolt', 'firebolt')).toBe(true)
  })

  it('matches any configured field', () => {
    expect(matchesAnyTextSearchQuery(['Wizard', 'Human sorcerer'], 'sorcerer')).toBe(true)
    expect(matchesAnyTextSearchQuery(['Wizard', 'Human sorcerer'], 'elf')).toBe(false)
  })

  it('includes all rows for an empty query', () => {
    expect(matchesTextSearchQuery('Wizard', '')).toBe(true)
    expect(matchesAnyTextSearchQuery(['Wizard'], undefined)).toBe(true)
  })
})
