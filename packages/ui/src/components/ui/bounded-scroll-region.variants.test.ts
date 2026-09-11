import { describe, expect, it } from 'vitest'

import { boundedScrollRegionClasses } from './bounded-scroll-region.variants'

describe('boundedScrollRegionClasses', () => {
  it('owns scrollbar behavior without flex sizing', () => {
    expect(boundedScrollRegionClasses).toContain('overflow-y-auto')
    expect(boundedScrollRegionClasses).toContain('scrollbar-slim')
    expect(boundedScrollRegionClasses).toContain('scrollbar-gutter-stable')
    expect(boundedScrollRegionClasses).not.toContain('flex-1')
    expect(boundedScrollRegionClasses).not.toContain('min-h-0')
  })
})
