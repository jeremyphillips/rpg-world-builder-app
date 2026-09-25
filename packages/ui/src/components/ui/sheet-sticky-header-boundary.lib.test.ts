import { describe, expect, it } from 'vitest'

import { computeSheetStickyHeaderStuck } from './sheet-sticky-header-boundary.lib'

function createEntry({
  isIntersecting,
  sentinelTop,
  rootTop,
}: {
  isIntersecting: boolean
  sentinelTop: number
  rootTop: number
}): IntersectionObserverEntry {
  return {
    isIntersecting,
    boundingClientRect: {
      top: sentinelTop,
      bottom: sentinelTop + 1,
    } as DOMRectReadOnly,
    rootBounds: {
      top: rootTop,
      bottom: rootTop + 400,
    } as DOMRectReadOnly,
  } as IntersectionObserverEntry
}

describe('computeSheetStickyHeaderStuck', () => {
  it('returns false while the sentinel is intersecting', () => {
    expect(
      computeSheetStickyHeaderStuck(
        createEntry({ isIntersecting: true, sentinelTop: 120, rootTop: 0 }),
      ),
    ).toBe(false)
  })

  it('returns false when the sentinel is below the viewport and not yet reached', () => {
    expect(
      computeSheetStickyHeaderStuck(
        createEntry({ isIntersecting: false, sentinelTop: 420, rootTop: 0 }),
      ),
    ).toBe(false)
  })

  it('returns true when the sentinel has scrolled past the sticky boundary', () => {
    expect(
      computeSheetStickyHeaderStuck(
        createEntry({ isIntersecting: false, sentinelTop: -1, rootTop: 0 }),
      ),
    ).toBe(true)
  })
})
