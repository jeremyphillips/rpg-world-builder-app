import { describe, expect, it } from 'vitest'

import { resolveAvailabilityFilteredEmptyCopy } from './availability-empty-state-copy.lib'

describe('resolveAvailabilityFilteredEmptyCopy', () => {
  it('returns hidden-unavailable copy when available filter hides all rows', () => {
    expect(
      resolveAvailabilityFilteredEmptyCopy({
        campaignAvailability: 'available',
        unavailableCount: 3,
        visibleCount: 0,
        pluralNoun: 'creature types',
      }),
    ).toEqual({
      kind: 'hiddenUnavailable',
      noMatchesLine: 'No available creature types match these filters.',
      unavailableLine: '3 unavailable creature types match.',
    })
  })

  it('returns generic when no rows are visible without hidden unavailable signal', () => {
    expect(
      resolveAvailabilityFilteredEmptyCopy({
        campaignAvailability: 'all',
        unavailableCount: 0,
        visibleCount: 0,
        pluralNoun: 'creature types',
      }),
    ).toEqual({ kind: 'generic' })
  })
})
