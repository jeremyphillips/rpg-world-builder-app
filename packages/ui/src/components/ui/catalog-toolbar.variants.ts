import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { dialogPanelSectionInsetXClasses } from './dialog-panel.variants'

/** Catalog toolbar inset matches dialog-panel section inset (picker chrome, not a parallel SSOT). */
export const catalogToolbarVariants = cva(cn('space-y-4 pb-4', dialogPanelSectionInsetXClasses))

export const catalogToolbarSearchRowVariants = cva('relative')

export const catalogToolbarSearchIconVariants = cva(
  'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2',
  {
    variants: {
      disabled: {
        true: 'text-input-disabled',
        false: 'text-input-placeholder',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

export const catalogToolbarTabRowVariants = cva(
  'flex items-center justify-between gap-4 border-b border-border',
)

/**
 * Utility band. `@min-[32rem]` is the wide row; below that the content-filter
 * region and the view stack stack. 32rem sits above catalog-drawer content
 * width (550px sheet minus section inset), so a narrow drawer does not use
 * the viewport `sm:` row.
 */
export const catalogToolbarUtilityBandVariants = cva(
  '@container flex flex-col gap-2 @min-[32rem]:flex-row @min-[32rem]:items-end @min-[32rem]:justify-between',
)

/** Lower content filters. Omitted by the toolbar when this region is empty. */
export const catalogToolbarUtilityContentVariants = cva('flex min-w-0 flex-wrap items-end gap-2')

/** Sort over Reset. The stack stays at the end in both the row and the stacked band. */
export const catalogToolbarViewControlsVariants = cva(
  'ml-auto flex w-fit flex-col items-start gap-2',
)

export const catalogToolbarStandaloneActionsVariants = cva('flex justify-end')
