import { cva } from 'class-variance-authority'

/** Result summary row — compact utility-bar copy. */
export const overviewResultSummaryVariants = cva(
  'flex min-w-0 flex-wrap items-center gap-y-1 text-xs text-muted-foreground',
)

/** Pipe separator between result count and supplemental disclosure. */
export const overviewResultSummaryPipeVariants = cva('px-2 text-border-subtle')

/** Middle-dot separator before Show/Hide actions. */
export const overviewResultSummaryDotVariants = cva('px-2 text-muted-foreground')
