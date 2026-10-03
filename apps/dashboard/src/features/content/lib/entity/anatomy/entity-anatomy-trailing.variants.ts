import { cva } from 'class-variance-authority'

/** Action, utility, and group-primary content — the RowAnatomy cell owns vertical placement. */
export const entityAnatomyTrailingActionVariants = cva('flex shrink-0')

export const entityAnatomyTrailingIndicatorVariants = cva('flex shrink-0 text-muted-foreground')

export const entityAnatomyTrailingGroupSecondaryVariants = cva(
  'shrink-0 text-xs tabular-nums text-muted-foreground',
)
