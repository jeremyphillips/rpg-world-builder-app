import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Bordered faint shell for the desktop rules configuration section rail. */
export const rulesConfigFieldNavShellClasses = cn(
  'rounded-lg border border-border-subtle bg-surface-faint p-4 text-foreground',
  establishSurfaceCurrent('surface-faint'),
)

/**
 * Stretch column beside the main form — full row height, not sticky itself.
 * Sticky belongs on the short inner {@link rulesConfigFieldNavStickyClasses} nav panel.
 */
export const rulesConfigFieldNavRailSlotClasses =
  'flex shrink-0 flex-col gap-4 lg:w-56 lg:self-stretch'

/**
 * Desktop nav panel — sticky within the stretch column.
 * `top` uses a calc fallback because `--app-sticky-chrome-block-size` may not resolve on this node.
 */
export const rulesConfigFieldNavStickyClasses =
  'lg:sticky lg:top-[var(--app-sticky-chrome-block-size,calc(3rem+2.5rem))] lg:self-start'

/** Desktop rail width — applied to the nav panel inside the stretch column. */
export const rulesConfigFieldNavPanelClasses = cn(
  'hidden w-56 lg:block',
  rulesConfigFieldNavStickyClasses,
)

/** Nested section leaf links in the desktop rules configuration rail. */
export const rulesConfigFieldNavLeafLinkClasses = cva(
  'block rounded-md py-1.5 pl-2 pr-3 text-sm transition-colors',
  {
    variants: {
      active: {
        true: 'font-bold text-foreground',
        false: 'font-normal text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)
