import { cva } from 'class-variance-authority'

export const setupSummaryCardSectionClasses = 'flex flex-col gap-y-3'

export const setupSummaryCardShellClasses =
  'overflow-hidden rounded-md border border-border bg-surface-muted'

export const setupSummaryCardListClasses = 'flex flex-col'

export const setupSummaryCardRowClasses = 'flex items-start justify-between gap-3 px-3 py-2'

export const setupSummaryCardRowDividerClasses = 'border-t border-border'

export const setupSummaryCardRowCopyClasses =
  'flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5'

export const setupSummaryCardRowLabelVariants = cva('text-sm text-muted-foreground')

export const setupSummaryCardRowValueVariants = cva('text-sm font-body-emphasis text-foreground')

export const setupSummaryCardRowHelperVariants = cva('w-full text-xs text-muted-foreground')

export const setupSummaryCardActionLinkClasses = 'h-auto shrink-0 px-0 text-xs'
