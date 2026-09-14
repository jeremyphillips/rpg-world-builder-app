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
