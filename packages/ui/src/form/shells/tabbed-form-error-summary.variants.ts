import { cn } from '../../lib/utils'

export const tabbedFormErrorSummaryClasses = cn(
  'mb-3 flex flex-col gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3',
  'text-sm text-destructive',
)

export const tabbedFormErrorSummaryMessageClasses = 'leading-snug'

export const tabbedFormErrorSummaryActionsClasses = 'flex flex-wrap gap-2'

export const tabbedFormErrorSummaryReviewButtonClasses = cn(
  'inline-flex items-center rounded-sm px-1.5 py-0.5',
  'text-sm font-medium underline-offset-2 hover:underline',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
)
