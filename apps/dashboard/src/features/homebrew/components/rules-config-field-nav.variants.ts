import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Bordered faint shell for the desktop rules configuration section rail. */
export const rulesConfigFieldNavShellClasses = cn(
  'rounded-lg border border-border-subtle bg-surface-faint p-4 text-foreground',
  establishSurfaceCurrent('surface-faint'),
)

/** Sticky slot for document-scroll hub detail layouts — direct flex-row sibling of main column. */
export const rulesConfigFieldNavRailSlotClasses = cn(
  'flex shrink-0 flex-col gap-4 lg:sticky lg:top-[var(--app-sticky-chrome-block-size)] lg:self-start',
)

/** Desktop rail width — applied to the nav panel inside the sticky slot. */
export const rulesConfigFieldNavPanelClasses = 'hidden w-56 lg:block'
