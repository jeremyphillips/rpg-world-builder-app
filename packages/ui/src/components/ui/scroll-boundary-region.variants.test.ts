import { describe, expect, it } from 'vitest'

import {
  scrollBoundaryBottomShadowClasses,
  scrollBoundaryRegionViewportClasses,
  scrollBoundaryTopShadowClasses,
} from './scroll-boundary-region.variants'
import { boundedScrollRegionClasses } from './bounded-scroll-region.variants'

describe('scroll-boundary-region variants', () => {
  it('composes bounded scroll behavior on the viewport', () => {
    expect(scrollBoundaryRegionViewportClasses).toContain(boundedScrollRegionClasses)
    expect(scrollBoundaryRegionViewportClasses).toContain('min-h-0')
    expect(scrollBoundaryRegionViewportClasses).toContain('flex-1')
  })

  it('uses warm translucent gradient shadows instead of surface lift', () => {
    expect(scrollBoundaryTopShadowClasses).toContain('bg-gradient-to-b')
    expect(scrollBoundaryBottomShadowClasses).toContain('bg-gradient-to-t')
    expect(scrollBoundaryTopShadowClasses).toContain('var(--foreground)')
    expect(scrollBoundaryTopShadowClasses).toContain('transparent')
    expect(scrollBoundaryBottomShadowClasses).toContain('var(--border-subtle)')
    expect(scrollBoundaryBottomShadowClasses).toContain('h-2')
    expect(scrollBoundaryBottomShadowClasses).toContain('data-[visible=true]:opacity-70')
  })
})
