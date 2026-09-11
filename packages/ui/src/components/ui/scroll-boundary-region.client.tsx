'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { resolveScrollBoundaryState, type ScrollBoundaryState } from './scroll-boundary-region.lib'
import {
  scrollBoundaryBottomShadowClasses,
  scrollBoundaryRegionRootClasses,
  scrollBoundaryRegionViewportClasses,
  scrollBoundaryTopShadowClasses,
} from './scroll-boundary-region.variants'

const INITIAL_SCROLL_BOUNDARY_STATE: ScrollBoundaryState = {
  showTopShadow: false,
  showBottomShadow: false,
}

export function useScrollBoundaryRegion() {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [state, setState] = React.useState<ScrollBoundaryState>(INITIAL_SCROLL_BOUNDARY_STATE)

  const updateScrollBoundaryState = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    setState(
      resolveScrollBoundaryState(viewport.scrollTop, viewport.scrollHeight, viewport.clientHeight),
    )
  }, [])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    updateScrollBoundaryState()
    viewport.addEventListener('scroll', updateScrollBoundaryState, { passive: true })

    const resizeObserver = new ResizeObserver(updateScrollBoundaryState)
    resizeObserver.observe(viewport)

    return () => {
      viewport.removeEventListener('scroll', updateScrollBoundaryState)
      resizeObserver.disconnect()
    }
  }, [updateScrollBoundaryState])

  return { viewportRef, state, updateScrollBoundaryState }
}

export type ScrollBoundaryRegionProps = React.ComponentPropsWithoutRef<'div'> & {
  viewportClassName?: string
}

/**
 * Bounded scroll viewport with surface-relative boundary shadows that signal
 * clipped content above or below a fixed edge. Adjacent sections own dividers;
 * this primitive only adds low-elevation gradient fades when content scrolls
 * underneath the boundary.
 */
export function ScrollBoundaryRegion({
  className,
  viewportClassName,
  children,
  ...viewportProps
}: ScrollBoundaryRegionProps) {
  const { viewportRef, state } = useScrollBoundaryRegion()

  return (
    <div className={cn(scrollBoundaryRegionRootClasses, className)}>
      <div
        aria-hidden
        data-visible={state.showTopShadow}
        className={scrollBoundaryTopShadowClasses}
      />
      <div
        ref={viewportRef}
        className={cn(scrollBoundaryRegionViewportClasses, viewportClassName)}
        {...viewportProps}
      >
        {children}
      </div>
      <div
        aria-hidden
        data-visible={state.showBottomShadow}
        className={scrollBoundaryBottomShadowClasses}
      />
    </div>
  )
}
