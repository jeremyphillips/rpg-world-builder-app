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
  /** Optional ref to the scroll viewport (merged with the internal measurement ref). */
  viewportRef?: React.Ref<HTMLDivElement>
}

/**
 * Bounded scroll viewport with surface-relative boundary shadows that signal
 * clipped content above or below a fixed edge. Adjacent sections own dividers;
 * this primitive only adds low-elevation gradient fades when content scrolls
 * underneath the boundary.
 */
function assignScrollBoundaryViewportRef(
  node: HTMLDivElement | null,
  internalRef: React.RefObject<HTMLDivElement | null>,
  externalRef?: React.Ref<HTMLDivElement>,
) {
  internalRef.current = node

  if (typeof externalRef === 'function') {
    externalRef(node)
    return
  }

  if (externalRef) {
    externalRef.current = node
  }
}

export function ScrollBoundaryRegion({
  className,
  viewportClassName,
  viewportRef: externalViewportRef,
  children,
  ...viewportProps
}: ScrollBoundaryRegionProps) {
  const { viewportRef, state } = useScrollBoundaryRegion()
  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      assignScrollBoundaryViewportRef(node, viewportRef, externalViewportRef)
    },
    [externalViewportRef, viewportRef],
  )

  return (
    <div className={cn(scrollBoundaryRegionRootClasses, className)}>
      <div
        aria-hidden
        data-visible={state.showTopShadow}
        className={scrollBoundaryTopShadowClasses}
      />
      <div
        ref={setViewportRef}
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
