import { cva } from 'class-variance-authority'

export const entityAnatomyTrailingActionVariants = cva('flex shrink-0')

export const entityAnatomyTrailingIndicatorVariants = cva('flex shrink-0 text-muted-foreground')

export const entityAnatomyTrailingGroupVariants = cva('flex shrink-0 flex-col items-end gap-0.5')

export const entityAnatomyTrailingGroupPrimaryVariants = cva('flex shrink-0 items-center')

export const entityAnatomyTrailingGroupSecondaryVariants = cva(
  'shrink-0 text-xs tabular-nums text-muted-foreground',
)
