import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionTopInsetClasses,
  dialogPanelSectionInsetXClasses,
  dialogPanelSectionSeparatorBorderClasses,
} from './dialog-panel.variants'
import {
  scrollBoundaryRegionRootClasses,
  scrollBoundaryTopShadowHeightClasses,
  scrollBoundaryTopShadowTintClasses,
} from './scroll-boundary-region.variants'

/** Clip shell — viewport scrolls; bottom boundary shadow docks to this root. */
export const sheetMediaScrollRootVariants = cva(scrollBoundaryRegionRootClasses)

/** Single scrollport for media, sticky identity header, and padded body content. */
export const sheetMediaScrollViewportVariants = cva(
  'flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-slim text-sm',
)

export const sheetMediaScrollMediaVariants = cva('shrink-0 w-full overflow-hidden')

/** Observed boundary between media and the sticky identity header. */
export const sheetMediaScrollSentinelVariants = cva('pointer-events-none h-px w-full shrink-0')

export const sheetMediaScrollStickyHeaderVariants = cva(
  cn(
    'sticky top-0 z-10 shrink-0 border-b',
    dialogPanelSectionSeparatorBorderClasses,
    'data-[stuck=true]:bg-[var(--surface-current)]',
  ),
)

/** Scroll affordance below the pinned header separator — not the viewport top edge. */
export const sheetMediaScrollStickyHeaderShadowVariants = cva(
  cn(
    'pointer-events-none absolute inset-x-0 top-full z-10',
    scrollBoundaryTopShadowHeightClasses,
    'bg-gradient-to-b',
    scrollBoundaryTopShadowTintClasses,
    'to-transparent opacity-0 transition-opacity duration-150 data-[visible=true]:opacity-100',
  ),
)

export const sheetMediaScrollBodyVariants = cva(
  cn(
    dialogPanelSectionInsetXClasses,
    'pe-6',
    dialogPanelScrollRegionTopInsetClasses,
    dialogPanelScrollRegionBottomInsetClasses,
  ),
)
