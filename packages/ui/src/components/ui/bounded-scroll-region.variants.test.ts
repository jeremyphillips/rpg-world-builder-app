import { describe, expect, it } from 'vitest'

import {
  boundedScrollRegionClasses,
  boundedScrollRegionEndInsetClasses,
} from './bounded-scroll-region.variants'

describe('boundedScrollRegionClasses', () => {
  it('owns scrollbar behavior without flex sizing', () => {
    expect(boundedScrollRegionClasses).toContain('overflow-y-auto')
    expect(boundedScrollRegionClasses).toContain('scrollbar-slim')
    expect(boundedScrollRegionClasses).toContain(boundedScrollRegionEndInsetClasses)
    expect(boundedScrollRegionClasses).not.toContain('flex-1')
    expect(boundedScrollRegionClasses).not.toContain('min-h-0')
  })

  it('reserves inline-end space for slim scrollbar track width', () => {
    expect(boundedScrollRegionEndInsetClasses).toBe('pe-2.5')
  })
})
