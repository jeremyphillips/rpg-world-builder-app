import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMediaManagerScrollBoundary } from './use-media-manager-scroll-boundary'

describe('useMediaManagerScrollBoundary', () => {
  it('shows the header shadow when either column scrolls away from the top', () => {
    const { result } = renderHook(() => useMediaManagerScrollBoundary())

    expect(result.current.headerScrolled).toBe(false)

    act(() => {
      result.current.onGalleryBoundaryChange({
        showTopShadow: true,
        showBottomShadow: false,
      })
    })

    expect(result.current.headerScrolled).toBe(true)

    act(() => {
      result.current.onWorkspaceBoundaryChange({
        showTopShadow: false,
        showBottomShadow: true,
      })
    })

    expect(result.current.headerScrolled).toBe(true)

    act(() => {
      result.current.onGalleryBoundaryChange({
        showTopShadow: false,
        showBottomShadow: false,
      })
    })

    expect(result.current.headerScrolled).toBe(false)
  })
})
