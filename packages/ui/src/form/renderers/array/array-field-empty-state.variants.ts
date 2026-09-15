import { cva } from 'class-variance-authority'

export const arrayFieldEmptyStatePanelVariants = cva(
  'rounded-md border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground',
)

export const arrayFieldEmptyStateRequiredVariants = cva('text-xs text-muted-foreground')
