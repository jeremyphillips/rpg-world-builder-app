import { describe, expect, it } from 'vitest'

import {
  GLOBAL_SEARCH_FILTER_GROUP_ENTRIES,
  GLOBAL_SEARCH_FILTER_GROUPS,
  getGlobalSearchFilterGroupLabel,
} from './filter-group'

describe('global search filter group vocabulary', () => {
  it('exposes stable filter group ids and labels', () => {
    expect(GLOBAL_SEARCH_FILTER_GROUPS).toEqual(['characters', 'content', 'game-terms'])
    expect(getGlobalSearchFilterGroupLabel('content')).toBe(
      GLOBAL_SEARCH_FILTER_GROUP_ENTRIES.content.label,
    )
  })
})
