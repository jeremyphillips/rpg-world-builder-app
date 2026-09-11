import { cn } from '../../lib/utils'

/** Inline-end inset (`calc(var(--spacing) * 2.5)`) — keeps scrollbar thumbs off content edges. */
export const boundedScrollRegionEndInsetClasses = 'pe-2.5'

/** Scrollbar behavior for bounded inner panels — consumers add flex sizing separately. */
export const boundedScrollRegionClasses = cn(
  'overflow-y-auto scrollbar-slim',
  boundedScrollRegionEndInsetClasses,
)
