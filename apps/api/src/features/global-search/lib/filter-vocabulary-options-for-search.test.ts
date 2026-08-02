import { describe, expect, it } from 'vitest'

import {
  filterVocabularyOptionsForSearch,
  isSearchViewerManager,
  projectVocabularySearchAvailability,
} from './filter-vocabulary-options-for-search'

describe('filterVocabularyOptionsForSearch', () => {
  const options = [
    { id: 'humanoid', status: 'active' as const },
    { id: 'fey', status: 'disabled' as const },
  ]

  it('returns all options for managers', () => {
    expect(isSearchViewerManager('owner')).toBe(true)
    expect(filterVocabularyOptionsForSearch(options, 'owner')).toEqual(options)
  })

  it('hides disabled options for players', () => {
    expect(filterVocabularyOptionsForSearch(options, 'pc')).toEqual([options[0]])
  })

  it('projects campaignAvailable false for disabled vocabulary', () => {
    expect(projectVocabularySearchAvailability('active')).toEqual({})
    expect(projectVocabularySearchAvailability('disabled')).toEqual({
      campaignAvailable: false,
    })
  })
})
