import { cva } from 'class-variance-authority'

export const catalogToolbarVariants = cva('space-y-4 px-6 pb-4')

export const catalogToolbarSearchRowVariants = cva('relative')

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

export const catalogFilterChipsLabelVariants = cva('text-sm text-muted-foreground')
