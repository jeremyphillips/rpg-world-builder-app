import { describe, expect, it } from 'vitest'

import {
  hasCatalogPickerNarrowingCriteria,
  hasCatalogPickerResetViewCriteria,
  resolveCatalogPickerResultSummary,
} from './catalog-picker-filter-state.lib'

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

  it('shows a count only when search, filters, or tabs narrow the list', () => {
    expect(
      hasCatalogPickerNarrowingCriteria({
        structuredFilterCount: 0,
        searchQuery: '',
      }),
    ).toBe(false)
    expect(resolveCatalogPickerResultSummary({ visible: 4, total: 24, narrowing: false })).toEqual(
      {},
    )
    expect(
      resolveCatalogPickerResultSummary({
        visible: 4,
        total: 24,
        narrowing: hasCatalogPickerNarrowingCriteria({
          structuredFilterCount: 1,
          searchQuery: '',
        }),
      }),
    ).toEqual({ summary: '4 of 24', summaryReserveLabel: '24 of 24' })
    expect(
      resolveCatalogPickerResultSummary({
        visible: 87,
        total: 87,
        narrowing: hasCatalogPickerNarrowingCriteria({
          structuredFilterCount: 0,
          searchQuery: 'rope',
        }),
      }),
    ).toEqual({ summary: '87 of 87', summaryReserveLabel: '87 of 87' })
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
