import { cn } from '../../lib/utils'
import { boundedScrollRegionClasses } from './bounded-scroll-region.variants'

/** Warm translucent tint — foreground/border ink, not a lifted neutral surface. */
export const scrollBoundaryTopShadowTintClasses =
  'from-[color-mix(in_oklch,var(--foreground)_5%,transparent)]'

/** Softer bottom affordance — narrower band, lighter tint than the top edge. */
export const scrollBoundaryBottomShadowTintClasses =
  'from-[color-mix(in_oklch,var(--border-subtle)_45%,transparent)]'

export const scrollBoundaryTopShadowHeightClasses = 'h-2.5'

export const scrollBoundaryBottomShadowHeightClasses = 'h-2'

export const scrollBoundaryRegionRootClasses = 'relative flex min-h-0 flex-1 flex-col'

export const scrollBoundaryRegionViewportClasses = cn('min-h-0 flex-1', boundedScrollRegionClasses)

export const scrollBoundaryTopShadowClasses = cn(
  'pointer-events-none absolute inset-x-0 top-0 z-10',
  scrollBoundaryTopShadowHeightClasses,
  'bg-gradient-to-b',
  scrollBoundaryTopShadowTintClasses,
  'to-transparent opacity-0 transition-opacity duration-150 data-[visible=true]:opacity-100',
)

export const scrollBoundaryBottomShadowClasses = cn(
  'pointer-events-none absolute inset-x-0 bottom-0 z-10',
  scrollBoundaryBottomShadowHeightClasses,
  'bg-gradient-to-t',
  scrollBoundaryBottomShadowTintClasses,
  'via-transparent to-transparent opacity-0 transition-opacity duration-150 data-[visible=true]:opacity-70',
)
