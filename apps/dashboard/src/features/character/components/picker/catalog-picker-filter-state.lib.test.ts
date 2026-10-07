import { describe, expect, it } from 'vitest'

import { hasCatalogPickerResetViewCriteria } from './catalog-picker-filter-state.lib'

describe('hasCatalogPickerResetViewCriteria', () => {
  it('ignores sort when the toolbar does not pass a sort mode', () => {
    expect(
      hasCatalogPickerResetViewCriteria({
        structuredFilterCount: 0,
        searchQuery: '',
      }),
    ).toBe(false)
  })

  it('counts a non-default sort only when both sort modes are passed', () => {
    expect(
      hasCatalogPickerResetViewCriteria({
        structuredFilterCount: 0,
        searchQuery: '',
        sortMode: 'name_asc',
        defaultSortMode: 'best_match',
      }),
    ).toBe(true)
  })

  it('counts search and structured filters without sort', () => {
    expect(
      hasCatalogPickerResetViewCriteria({
        structuredFilterCount: 1,
        searchQuery: '',
      }),
    ).toBe(true)
    expect(
      hasCatalogPickerResetViewCriteria({
        structuredFilterCount: 0,
        searchQuery: 'rope',
      }),
    ).toBe(true)
  })
})
