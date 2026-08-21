import { cva } from 'class-variance-authority'

export const entityItemTrailingActionVariants = cva('flex shrink-0')

export const entityItemTrailingIndicatorVariants = cva('flex shrink-0 text-muted-foreground')

export const entityItemTrailingGroupVariants = cva('flex shrink-0 flex-col items-end gap-0.5')

export const entityItemTrailingGroupPrimaryVariants = cva('flex shrink-0 items-center')

export const entityItemTrailingGroupSecondaryVariants = cva(
  'shrink-0 text-xs tabular-nums text-muted-foreground',
)
