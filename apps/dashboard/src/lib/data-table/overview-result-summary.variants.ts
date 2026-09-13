import { cva } from 'class-variance-authority'

/** Result summary row — compact utility-bar copy. */
export const overviewResultSummaryVariants = cva(
  'flex min-w-0 flex-wrap items-center gap-y-1 text-xs text-muted-foreground',
)

/** Middle-dot separator before Show/Hide actions. */
export const overviewResultSummaryDotVariants = cva('px-2 text-muted-foreground')
