import { describe, expect, it } from 'vitest'

import { resolveAvailabilitySummarySupplement } from './availability-summary-supplement.lib'

describe('resolveAvailabilitySummarySupplement', () => {
  it('omits the supplement when every matching row is available', () => {
    expect(
      resolveAvailabilitySummarySupplement({ mode: 'available', unavailableCount: 0 }),
    ).toBeNull()
  })

  it('offers Show while unavailable matches are hidden', () => {
    expect(
      resolveAvailabilitySummarySupplement({ mode: 'available', unavailableCount: 3 }),
    ).toEqual({
      label: '3 unavailable',
      actionLabel: 'Show',
    })
  })

  it('offers Hide when unavailable matches are included', () => {
    expect(resolveAvailabilitySummarySupplement({ mode: 'all', unavailableCount: 1 })).toEqual({
      label: '1 unavailable',
      actionLabel: 'Hide',
    })
  })

  it('omits the supplement when the mode is already unavailable', () => {
    expect(
      resolveAvailabilitySummarySupplement({ mode: 'unavailable', unavailableCount: 4 }),
    ).toBeNull()
  })
})
