import { describe, expect, it } from 'vitest'

import {
  formatAvailabilityCountSummary,
  joinAvailabilityCountSummarySegments,
  resolveStableMasterDetailCountSummaryParts,
} from './availability-count-summary.lib'

describe('formatAvailabilityCountSummary', () => {
  it('suppresses zero-value availability buckets', () => {
    expect(formatAvailabilityCountSummary(1, 0)).toBe('1 available')
    expect(formatAvailabilityCountSummary(0, 2)).toBe('2 unavailable')
    expect(formatAvailabilityCountSummary(13, 0)).toBe('13 available')
  })

  it('joins mixed non-zero buckets', () => {
    expect(formatAvailabilityCountSummary(12, 1)).toBe('12 available · 1 unavailable')
  })
})

describe('resolveStableMasterDetailCountSummaryParts', () => {
  it('returns null for an empty collection', () => {
    expect(
      resolveStableMasterDetailCountSummaryParts({ availableCount: 0, unavailableCount: 0 }),
    ).toBeNull()
  })

  it('returns available-only copy when every row is available', () => {
    expect(
      resolveStableMasterDetailCountSummaryParts({ availableCount: 3, unavailableCount: 0 }),
    ).toEqual({
      segments: ['3 available'],
      showUnavailableToggle: false,
    })
  })

  it('returns unavailable-only copy when every row is unavailable', () => {
    expect(
      resolveStableMasterDetailCountSummaryParts({ availableCount: 0, unavailableCount: 2 }),
    ).toEqual({
      segments: ['2 unavailable'],
      showUnavailableToggle: true,
    })
  })

  it('joins mixed non-zero buckets', () => {
    expect(
      resolveStableMasterDetailCountSummaryParts({ availableCount: 3, unavailableCount: 2 }),
    ).toEqual({
      segments: ['3 available · 2 unavailable'],
      showUnavailableToggle: true,
    })
  })
})

describe('joinAvailabilityCountSummarySegments', () => {
  it('joins arbitrary surface-owned fragments with the shared separator', () => {
    expect(joinAvailabilityCountSummarySegments(['13 results', '1 unavailable'])).toBe(
      '13 results · 1 unavailable',
    )
  })
})
