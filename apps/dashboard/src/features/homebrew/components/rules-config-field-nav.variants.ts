import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Desktop rules configuration section rail column width (`lg:w-60` on the slot wrapper). */
export const rulesConfigFieldNavRailWidthClasses = 'w-60'

/** Bordered faint shell for the desktop rules configuration section rail. */
export const rulesConfigFieldNavShellClasses = cn(
  'rounded-lg border border-border-subtle bg-surface-faint p-4 text-foreground',
  establishSurfaceCurrent('surface-faint'),
)

/**
 * Stretch column beside the main form — full row height, not sticky itself.
 * Sticky belongs on the short inner {@link rulesConfigFieldNavStickyClasses} nav panel.
 */
export const rulesConfigFieldNavRailSlotClasses = cn(
  'flex shrink-0 flex-col gap-4 lg:self-stretch',
  'lg:w-60',
)

/**
 * Desktop nav panel — sticky within the stretch column.
 * `top` uses a calc fallback because `--app-sticky-chrome-block-size` may not resolve on this node.
 */
export const rulesConfigFieldNavStickyClasses =
  'lg:sticky lg:top-[var(--app-sticky-chrome-block-size,calc(3rem+2.5rem))] lg:self-start'

/** Desktop rail width — applied to the nav panel inside the stretch column. */
export const rulesConfigFieldNavPanelClasses = cn(
  'hidden lg:block',
  rulesConfigFieldNavRailWidthClasses,
  rulesConfigFieldNavStickyClasses,
)

/** Left rule beside nested section leaf links. */
export const rulesConfigFieldNavLeafListClasses = cva('ml-3.5 mt-1 space-y-0.5 border-l-2 pl-2', {
  variants: {
    active: {
      true: 'border-neutral-contrast',
      false: 'border-border',
    },
  },
  defaultVariants: {
    active: false,
  },
})

/** Top-level section links in the desktop rules configuration rail. */
export const rulesConfigFieldNavSectionLinkClasses = cva(
  'block rounded-md px-3 py-2 text-sm transition-colors',
  {
    variants: {
      state: {
        inactive: 'font-normal text-muted-foreground hover:text-foreground',
        active: 'font-bold text-foreground',
        activeWithLeaf: 'font-bold text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  },
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
