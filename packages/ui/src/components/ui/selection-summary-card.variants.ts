import { cva } from 'class-variance-authority'

export const selectionSummaryCardSectionClasses = 'flex flex-col gap-y-2'

export const selectionSummaryCardShellClasses =
  'overflow-hidden rounded-md border border-border bg-surface-muted px-3 py-1'

export const selectionSummaryCardListClasses = 'flex flex-col'

export const selectionSummaryCardRowClasses =
  'flex justify-between gap-3 py-0.5 first:pt-0 last:pb-0'

export const selectionSummaryCardRowDividerClasses = 'border-t border-border-subtle'

export const selectionSummaryCardRowCopyColumnClasses = 'flex min-w-0 flex-1 flex-col'

/** Primary label/value band — matches compact control height (24px). */
export const selectionSummaryCardRowPrimaryLineClasses =
  'flex min-h-control-action-compact min-w-0 flex-1 flex-wrap items-center gap-x-1.5'

export const selectionSummaryCardRowActionColumnClasses =
  'flex shrink-0 self-start min-h-control-action-compact items-center'

export const selectionSummaryCardRowLabelVariants = cva('text-sm text-muted-foreground')

export const selectionSummaryCardRowValueVariants = cva(
  'text-sm font-body-emphasis text-foreground',
)

export const selectionSummaryCardRowValueButtonClasses =
  'cursor-pointer border-0 bg-transparent p-0 text-left transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'

export const selectionSummaryCardRowHelperVariants = cva('w-full text-xs text-muted-foreground')

export const selectionSummaryCardChangeActionClasses = 'shrink-0 px-0'
