import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Desktop in-page section rail column width (`lg:w-60` on the slot wrapper). */
export const inPageSectionNavRailWidthClasses = 'w-60'

/** Bordered faint shell for the desktop in-page section rail. */
export const inPageSectionNavShellClasses = cn(
  'rounded-lg border border-border-subtle bg-surface-faint p-4 text-foreground',
  establishSurfaceCurrent('surface-faint'),
)

/**
 * Stretch column beside the main column — full row height, not sticky itself.
 * Sticky belongs on the short inner nav panel.
 */
export const inPageSectionNavRailSlotClasses = cn(
  'flex shrink-0 flex-col gap-4 lg:self-stretch',
  'lg:w-60',
)

/** Desktop nav panel — sticky within the stretch column. */
export const inPageSectionNavStickyClasses =
  'lg:sticky lg:top-[var(--app-sticky-chrome-block-size,calc(3rem+2.5rem))] lg:self-start'

export const inPageSectionNavPanelClasses = cn(
  'hidden lg:block',
  inPageSectionNavRailWidthClasses,
  inPageSectionNavStickyClasses,
  'max-h-[calc(100vh-var(--app-sticky-chrome-block-size,calc(3rem+2.5rem))-2rem)] overflow-y-auto',
)

export const inPageSectionNavLeafListClasses = cva('ml-3.5 mt-1 space-y-0.5 border-l-2 pl-2', {
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

export const inPageSectionNavSectionLinkClasses = cva(
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

export const inPageSectionNavLeafLinkClasses = cva(
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
