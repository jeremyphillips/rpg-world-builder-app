'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { useScrollBoundaryRegion } from './scroll-boundary-region.client'
import { scrollBoundaryBottomShadowClasses } from './scroll-boundary-region.variants'
import { computeSheetStickyHeaderStuck } from './sheet-sticky-header-boundary.lib'
import {
  sheetMediaScrollBodyVariants,
  sheetMediaScrollMediaVariants,
  sheetMediaScrollRootVariants,
  sheetMediaScrollSentinelVariants,
  sheetMediaScrollStickyHeaderShadowVariants,
  sheetMediaScrollStickyHeaderVariants,
  sheetMediaScrollViewportVariants,
} from './sheet-media-scroll.variants'

export type SheetMediaScrollProps = {
  /** Full-bleed media rendered in flow above the sticky identity header. */
  media: React.ReactNode
  /** Identity header — typically {@link Sheet.Header}. */
  header: React.ReactNode
  children: React.ReactNode
  className?: string
}

function useSheetStickyHeaderStuck(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  sentinelRef: React.RefObject<HTMLDivElement | null>,
): boolean {
  const [stuck, setStuck] = React.useState(false)

  React.useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setStuck(computeSheetStickyHeaderStuck(entry))
        }
      },
      { root, threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [scrollRef, sentinelRef])

  return stuck
}

function stripEmbeddedHeaderSeparator(header: React.ReactNode): React.ReactNode {
  if (!React.isValidElement<{ className?: string }>(header)) {
    return header
  }

  return React.cloneElement(header, {
    className: cn('border-b-0', header.props.className),
  })
}

/**
 * Sheet anatomy when optional media precedes a sticky identity header.
 * Media and header share one scrollport; the header sticks once it crosses the top.
 */
export function SheetMediaScroll({ media, header, children, className }: SheetMediaScrollProps) {
  const { viewportRef, state: boundaryState } = useScrollBoundaryRegion()
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const stuck = useSheetStickyHeaderStuck(viewportRef, sentinelRef)
  const showHeaderBoundaryShadow = stuck && boundaryState.showTopShadow

  return (
    <div className={sheetMediaScrollRootVariants()}>
      <div ref={viewportRef} className={cn(sheetMediaScrollViewportVariants(), className)}>
        <div className={sheetMediaScrollMediaVariants()}>{media}</div>
        <div
          ref={sentinelRef}
          className={sheetMediaScrollSentinelVariants()}
          aria-hidden
          data-testid="sheet-sticky-header-sentinel"
        />
        <div
          className={sheetMediaScrollStickyHeaderVariants()}
          data-stuck={stuck ? 'true' : undefined}
          data-testid="sheet-sticky-header-shell"
        >
          {stripEmbeddedHeaderSeparator(header)}
          <div
            aria-hidden
            data-visible={showHeaderBoundaryShadow}
            data-testid="sheet-sticky-header-boundary-shadow"
            className={sheetMediaScrollStickyHeaderShadowVariants()}
          />
        </div>
        <div className={sheetMediaScrollBodyVariants()}>{children}</div>
      </div>
      <div
        aria-hidden
        data-visible={boundaryState.showBottomShadow}
        data-testid="sheet-media-scroll-bottom-shadow"
        className={scrollBoundaryBottomShadowClasses}
      />
    </div>
  )
}
