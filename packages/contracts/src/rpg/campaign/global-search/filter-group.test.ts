import { describe, expect, it } from 'vitest'

import {
  GLOBAL_SEARCH_FILTER_GROUP_ENTRIES,
  GLOBAL_SEARCH_FILTER_GROUPS,
  getGlobalSearchFilterGroupLabel,
  getGlobalSearchFilterGroupSentenceForm,
  getGlobalSearchFilterGroupTypeLabel,
} from './filter-group'

describe('global search filter group vocabulary', () => {
  it('exposes stable filter group ids and labels', () => {
    expect(GLOBAL_SEARCH_FILTER_GROUPS).toEqual(['characters', 'content', 'game-terms'])
    expect(getGlobalSearchFilterGroupLabel('content')).toBe(
      GLOBAL_SEARCH_FILTER_GROUP_ENTRIES.content.label,
    )
    expect(getGlobalSearchFilterGroupTypeLabel('characters')).toBe('Character')
    expect(getGlobalSearchFilterGroupTypeLabel('game-terms')).toBe('Game Term')
  })

  it('exposes plural sentence forms for typed filter groups', () => {
    expect(getGlobalSearchFilterGroupSentenceForm('characters', 2)).toBe('characters')
    expect(getGlobalSearchFilterGroupSentenceForm('content', 2)).toBe('content')
    expect(getGlobalSearchFilterGroupSentenceForm('game-terms', 2)).toBe('game terms')
    expect(getGlobalSearchFilterGroupSentenceForm('characters', 1)).toBe('character')
  })
})
