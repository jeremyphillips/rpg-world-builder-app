import { describe, expect, it } from 'vitest'

import {
  formatAvailabilityCountSummary,
  formatDataTableCountSummary,
  joinAvailabilityCountSummarySegments,
  resolveAvailabilityCountSummaryParts,
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

describe('resolveAvailabilityCountSummaryParts', () => {
  it('returns null for empty collections', () => {
    expect(resolveAvailabilityCountSummaryParts({ totalCount: 0, unavailableCount: 0 })).toBeNull()
  })

  it('returns null when all rows are available', () => {
    expect(resolveAvailabilityCountSummaryParts({ totalCount: 13, unavailableCount: 0 })).toBeNull()
  })

  it('returns unavailable-only copy when hidden unavailable rows exist', () => {
    expect(resolveAvailabilityCountSummaryParts({ totalCount: 13, unavailableCount: 1 })).toEqual({
      segments: ['1 unavailable'],
      showUnavailableToggle: true,
    })
  })

  it('returns plural unavailable copy for all-unavailable collections', () => {
    expect(resolveAvailabilityCountSummaryParts({ totalCount: 5, unavailableCount: 5 })).toEqual({
      segments: ['5 unavailable'],
      showUnavailableToggle: true,
    })
  })
})

describe('formatDataTableCountSummary', () => {
  it('renders only the visible result count when no unavailable rows exist', () => {
    expect(formatDataTableCountSummary({ visibleCount: 13, unavailableCount: 0 })).toBe(
      '13 results',
    )
  })

  it('renders hidden-unavailable copy without restating available rows', () => {
    expect(formatDataTableCountSummary({ visibleCount: 13, unavailableCount: 1 })).toBe(
      '13 results · 1 unavailable',
    )
  })

  it('renders shown-unavailable copy against the expanded visible count', () => {
    expect(formatDataTableCountSummary({ visibleCount: 14, unavailableCount: 1 })).toBe(
      '14 results · 1 unavailable',
    )
  })

  it('supports singular result labels', () => {
    expect(formatDataTableCountSummary({ visibleCount: 1, unavailableCount: 0 })).toBe('1 result')
  })
})

describe('joinAvailabilityCountSummarySegments', () => {
  it('joins arbitrary surface-owned fragments with the shared separator', () => {
    expect(joinAvailabilityCountSummarySegments(['13 results', '1 unavailable'])).toBe(
      '13 results · 1 unavailable',
    )
  })
})
