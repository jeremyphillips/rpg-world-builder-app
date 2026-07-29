import { describe, expect, it } from 'vitest'

import { matchesPrimaryTextQuery } from '@rpg/ui/lib/search-document'

describe('content overview search', () => {
  it('matches forgiving separator variants on content names', () => {
    expect(matchesPrimaryTextQuery('Fire Bolt', 'firebolt', 'forgiving')).toBe(true)
    expect(matchesPrimaryTextQuery('Fireball', 'fire ball', 'forgiving')).toBe(true)
  })

  it('includes all rows for an empty query', () => {
    expect(matchesPrimaryTextQuery('Wizard', '', 'forgiving')).toBe(true)
    expect(matchesPrimaryTextQuery('Wizard', '   ', 'forgiving')).toBe(true)
  })
})
