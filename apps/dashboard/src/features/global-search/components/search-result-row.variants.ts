import { cva } from 'class-variance-authority'

export const searchResultRowVariants = cva(
  'block w-full border-b border-border px-0 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
)

export const searchResultRowHeaderVariants = cva('flex items-start justify-between gap-3')

export const searchResultRowTitleRowVariants = cva('flex min-w-0 flex-1 items-center gap-2')

export const searchResultRowTypeLabelVariants = cva('shrink-0 text-xs text-muted-foreground')
