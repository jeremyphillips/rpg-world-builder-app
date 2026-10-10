import { cva } from 'class-variance-authority'

/**
 * Action, utility, and group-primary content. The RowAnatomy cell places the cluster.
 * This row centers meta copy with the control and keeps 10px between them.
 */
export const entityAnatomyTrailingActionVariants = cva('flex shrink-0 items-center gap-2.5')

export const entityAnatomyTrailingIndicatorVariants = cva('flex shrink-0 text-muted-foreground')

/** Quantity end slot — 14px, independent of the card body size. */
export const entityAnatomyTrailingQuantityLabelVariants = cva('text-sm tabular-nums')

/** Inline provenance or price sitting before a trailing control. */
export const entityAnatomyTrailingMetaVariants = cva('shrink-0 text-style-supporting')

/** Price or rarity-choice label in the trailing band — compact label role, foreground. */
export const entityAnatomyTrailingGroupSecondaryVariants = cva(
  'shrink-0 text-style-label tabular-nums text-foreground',
)
