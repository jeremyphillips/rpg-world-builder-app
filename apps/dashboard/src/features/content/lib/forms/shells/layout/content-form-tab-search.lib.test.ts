import { describe, expect, it } from 'vitest'

import {
  CONTENT_FORM_TAB_SEARCH_PARAM,
  resolveContentFormTabFromSearch,
} from './content-form-tab-search.lib'

describe('resolveContentFormTabFromSearch', () => {
  it('returns a matching tab id from search params', () => {
    const tabs = [
      { id: 'details', label: 'Details', fields: [] },
      { id: 'subclasses', label: 'Subclasses', fields: [] },
    ]
    expect(resolveContentFormTabFromSearch(tabs, 'subclasses')).toBe('subclasses')
    expect(resolveContentFormTabFromSearch(tabs, 'missing')).toBeUndefined()
    expect(CONTENT_FORM_TAB_SEARCH_PARAM).toBe('tab')
  })
})
