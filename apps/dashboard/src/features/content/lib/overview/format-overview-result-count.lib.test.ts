import { describe, expect, it } from 'vitest'

import { formatOverviewResultCount } from './format-overview-result-count.lib'

describe('formatOverviewResultCount', () => {
  it('formats a single unfiltered result', () => {
    expect(
      formatOverviewResultCount({ filteredCount: 1, availabilityScopedCount: 1, totalCount: 1 }),
    ).toBe('1 result')
  })

  it('formats multiple unfiltered results', () => {
    expect(
      formatOverviewResultCount({ filteredCount: 24, availabilityScopedCount: 24, totalCount: 24 }),
    ).toBe('24 results')
  })

  it('formats filtered results against availability-scoped total', () => {
    expect(
      formatOverviewResultCount({ filteredCount: 8, availabilityScopedCount: 24, totalCount: 30 }),
    ).toBe('8 of 24 results')
  })

  it('formats a single filtered result against multiple scoped results', () => {
    expect(
      formatOverviewResultCount({ filteredCount: 1, availabilityScopedCount: 5, totalCount: 5 }),
    ).toBe('1 of 5 results')
  })
})
