import { cva } from 'class-variance-authority'

export const STARTING_GOLD_BONUS_LABEL = 'Starting gold bonus'

export const startingGoldBonusFormulaVariants = cva('', {
  variants: {
    tone: {
      /** Disclosure tooltip inherits the tooltip's text-sm foreground. */
      inherit: '',
      muted: 'text-style-caption',
    },
  },
  defaultVariants: {
    tone: 'inherit',
  },
})
