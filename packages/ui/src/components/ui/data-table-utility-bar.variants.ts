import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'

/** Two-row utility bar rendered inside the table card above headers. */
export const dataTableUtilityBarVariants = cva('flex flex-col')

/** Row 1 — result context summary. */
export const dataTableUtilityBarSummaryRowVariants = cva(
  cn(
    'flex items-center bg-surface-subtle px-3 pt-2.5 pb-1.5 text-sm text-muted-foreground',
    establishSurfaceCurrent('surface-subtle'),
  ),
)

/** Row 2 — leading actions, flexible space, trailing actions. */
export const dataTableUtilityBarActionsRowVariants = cva(
  cn(
    'flex flex-wrap items-center gap-2 border-b border-border bg-surface-subtle px-3 py-1.5 min-h-9',
    establishSurfaceCurrent('surface-subtle'),
  ),
)

/** Leading action cluster — optional structural inset for column alignment. */
export const dataTableUtilityBarLeadingVariants = cva('flex min-w-0 flex-wrap items-center gap-2')

/** Trailing action cluster — columns menu, etc. */
export const dataTableUtilityBarTrailingVariants = cva(
  'ml-auto flex flex-wrap items-center justify-end gap-1',
)
