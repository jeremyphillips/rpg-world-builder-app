import { cva } from 'class-variance-authority'

export const selectionSummaryCardSectionClasses = 'flex flex-col gap-y-2'

export const selectionSummaryCardShellClasses =
  'overflow-hidden rounded-md border border-border bg-surface-muted px-3 py-1'

/** Shared column tracks: label | value | change action (values align across rows). */
export const selectionSummaryCardListClasses =
  'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-5'

/** Full-width row group — border-top spans all columns (avoids broken segment dividers). */
export const selectionSummaryCardRowGroupClasses =
  'col-span-3 grid grid-cols-subgrid items-center py-0.5'

export const selectionSummaryCardRowGroupDividerClasses = 'border-t border-border-subtle pt-0.5'

export const selectionSummaryCardRowLabelVariants = cva('text-sm text-muted-foreground')

export const selectionSummaryCardRowValueCellClasses = 'min-w-0'

export const selectionSummaryCardRowValueVariants = cva(
  'text-sm font-body-emphasis text-foreground',
)

export const selectionSummaryCardRowValueButtonClasses =
  'cursor-pointer border-0 bg-transparent p-0 text-left transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'

export const selectionSummaryCardRowActionColumnClasses =
  'flex min-h-control-action-compact shrink-0 items-center justify-end'

export const selectionSummaryCardRowHelperVariants = cva(
  'col-start-2 text-sm text-muted-foreground',
)

export const selectionSummaryCardChangeActionClasses = 'shrink-0'
