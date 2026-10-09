import { describe, expect, it } from 'vitest'

import { resultCountSizerLabels } from '@/lib/data-table/format-result-count.lib'

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

  it('treats search, filters, and tabs as narrowing', () => {
    expect(
      hasCatalogPickerNarrowingCriteria({
        structuredFilterCount: 0,
        searchQuery: '',
      }),
    ).toBe(false)
    expect(
      hasCatalogPickerNarrowingCriteria({
        structuredFilterCount: 1,
        searchQuery: '',
      }),
    ).toBe(true)
    expect(
      hasCatalogPickerNarrowingCriteria({
        structuredFilterCount: 0,
        searchQuery: 'rope',
      }),
    ).toBe(true)
  })

  it('always reports the visible count and reserves every count through the total', () => {
    expect(resolveCatalogPickerResultSummary({ visible: 4, total: 24 })).toEqual({
      summaryVisibleCount: 4,
      summaryReserveLabels: resultCountSizerLabels(24),
    })
    expect(resolveCatalogPickerResultSummary({ visible: 87, total: 87 })).toEqual({
      summaryVisibleCount: 87,
      summaryReserveLabels: resultCountSizerLabels(87),
    })
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
