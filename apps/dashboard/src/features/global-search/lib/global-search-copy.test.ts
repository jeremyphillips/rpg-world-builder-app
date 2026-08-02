import { describe, expect, it } from 'vitest'

import { GLOBAL_SEARCH_COPY } from './global-search-copy'

describe('GLOBAL_SEARCH_COPY', () => {
  it('uses distinct empty copy for all vs typed filter groups', () => {
    expect(GLOBAL_SEARCH_COPY.noResultsDescription('fire', 'all')).toBe(
      'Nothing matched “fire”. Try a different spelling or keyword.',
    )
    expect(GLOBAL_SEARCH_COPY.noResultsDescription('fire', 'characters')).toBe(
      'No characters matched “fire”. Try a different spelling or keyword.',
    )
    expect(GLOBAL_SEARCH_COPY.noResultsDescription('fire', 'content')).toBe(
      'No content matched “fire”. Try a different spelling or keyword.',
    )
    expect(GLOBAL_SEARCH_COPY.noResultsDescription('fire', 'game-terms')).toBe(
      'No game terms matched “fire”. Try a different spelling or keyword.',
    )
  })

  it('formats active result summaries for singular and plural counts', () => {
    expect(GLOBAL_SEARCH_COPY.activeResultsSummary(1, 'fire')).toBe('1 result for “fire”')
    expect(GLOBAL_SEARCH_COPY.activeResultsSummary(14, 'fire')).toBe('14 results for “fire”')
    expect(GLOBAL_SEARCH_COPY.activeResultsSummary(0, 'fire')).toBe('0 results for “fire”')
  })
})
