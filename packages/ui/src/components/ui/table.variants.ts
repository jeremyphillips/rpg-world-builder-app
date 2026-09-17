import { cva } from 'class-variance-authority'

/** Header row band — recessed neutral wash shared by content tables and data tables. */
export const tableHeaderRowVariants = cva(
  'border-b border-border bg-surface-strong hover:bg-surface-strong data-[state=selected]:bg-surface-strong',
)

export const tableHeaderRowClasses = tableHeaderRowVariants()
