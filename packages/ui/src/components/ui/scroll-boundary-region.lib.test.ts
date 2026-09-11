import { describe, expect, it } from 'vitest'

import { resolveScrollBoundaryState } from './scroll-boundary-region.lib'

describe('resolveScrollBoundaryState', () => {
  it('hides both shadows when content does not overflow', () => {
    expect(resolveScrollBoundaryState(0, 100, 100)).toEqual({
      showTopShadow: false,
      showBottomShadow: false,
    })
  })

  it('shows only the bottom shadow at the top of a scrollable region', () => {
    expect(resolveScrollBoundaryState(0, 200, 100)).toEqual({
      showTopShadow: false,
      showBottomShadow: true,
    })
  })

  it('shows only the top shadow at the bottom of a scrollable region', () => {
    expect(resolveScrollBoundaryState(100, 200, 100)).toEqual({
      showTopShadow: true,
      showBottomShadow: false,
    })
  })

  it('shows both shadows in the middle of a scrollable region', () => {
    expect(resolveScrollBoundaryState(50, 200, 100)).toEqual({
      showTopShadow: true,
      showBottomShadow: true,
    })
  })
})
