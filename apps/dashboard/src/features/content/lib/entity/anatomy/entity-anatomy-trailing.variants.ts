import { cva } from 'class-variance-authority'

/** Action, utility, and group-primary content — the RowAnatomy cell owns vertical placement. */
export const entityAnatomyTrailingActionVariants = cva('flex shrink-0 gap-1')

export const entityAnatomyTrailingIndicatorVariants = cva('flex shrink-0 text-muted-foreground')

/** Quantity end slot — 14px, independent of the card body size. */
export const entityAnatomyTrailingQuantityLabelVariants = cva('text-sm tabular-nums')

export const entityAnatomyTrailingGroupSecondaryVariants = cva(
  'shrink-0 text-xs tabular-nums text-muted-foreground',
)
