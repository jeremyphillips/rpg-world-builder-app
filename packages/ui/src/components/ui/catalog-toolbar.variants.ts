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

export const catalogToolbarFilterRowVariants = cva(
  'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
)

export const catalogToolbarFilterControlsVariants = cva(
  'flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4',
)

export const catalogToolbarFilterActionsVariants = cva(
  'flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-4',
)

export const catalogToolbarStandaloneActionsVariants = cva('flex justify-end')
