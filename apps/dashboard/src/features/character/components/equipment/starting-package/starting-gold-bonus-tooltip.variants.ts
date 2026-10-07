import { cva } from 'class-variance-authority'

export const STARTING_GOLD_BONUS_LABEL = 'Starting gold bonus'

/** Shared by the bonus tooltip and the tier disclosure columns. */
export const startingGoldBonusKeyVariants = cva('text-muted-foreground')

export const startingGoldBonusValueVariants = cva('text-foreground')

export const startingGoldBonusTooltipVariants = cva('grid gap-1')

/** Radio-card tooltip: one foreground line, no key/value column gap. */
export const startingGoldBonusSummaryVariants = cva('text-foreground')

export const startingGoldBonusFormulaVariants = cva('', {
  variants: {
    tone: {
      /** Disclosure tooltip inherits the tooltip's text-sm foreground. */
      inherit: '',
      muted: 'text-xs text-muted-foreground',
    },
  },
  defaultVariants: {
    tone: 'inherit',
  },
})
