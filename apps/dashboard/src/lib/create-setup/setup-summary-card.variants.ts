import { cva } from 'class-variance-authority'

export const setupSummaryCardSectionClasses = 'flex flex-col gap-y-2'

export const setupSummaryCardShellClasses =
  'overflow-hidden rounded-md border border-border bg-surface-muted px-3 py-1'

export const setupSummaryCardListClasses = 'flex flex-col'

export const setupSummaryCardRowClasses = 'flex justify-between gap-3'

export const setupSummaryCardRowDividerClasses = 'border-t border-border-subtle'

export const setupSummaryCardRowCopyColumnClasses = 'flex min-w-0 flex-1 flex-col'

/** Primary label/value band — matches compact control height (24px). */
export const setupSummaryCardRowPrimaryLineClasses =
  'flex min-h-control-action-compact min-w-0 flex-1 flex-wrap items-center gap-x-1.5'

export const setupSummaryCardRowActionColumnClasses =
  'flex shrink-0 self-start min-h-control-action-compact items-center'

export const setupSummaryCardRowLabelVariants = cva('text-sm text-muted-foreground')

export const setupSummaryCardRowValueVariants = cva('text-sm font-body-emphasis text-foreground')

export const setupSummaryCardRowValueButtonClasses =
  'cursor-pointer border-0 bg-transparent p-0 text-left transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'

export const setupSummaryCardRowHelperVariants = cva('w-full text-xs text-muted-foreground')

export const setupSummaryCardChangeActionClasses = 'shrink-0 px-0'
