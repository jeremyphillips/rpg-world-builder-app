import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Bordered subtle shell for the desktop rules configuration section rail. */
export const rulesConfigFieldNavShellClasses = cn(
  'rounded-lg border bg-surface-subtle p-4 text-foreground',
  establishSurfaceCurrent('surface-subtle'),
)

/** Sticky positioning for the desktop rail inside page-scroll hub detail layouts. */
export const rulesConfigFieldNavStickyClasses =
  'hidden w-56 shrink-0 lg:sticky lg:top-0 lg:block lg:self-start'
