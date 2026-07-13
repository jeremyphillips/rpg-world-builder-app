import { cva } from 'class-variance-authority'

export const emphasisDetailLineRootVariants = cva('')

export const emphasisDetailLinePrimaryVariants = cva('font-body-emphasis tabular-nums')

export const emphasisDetailLineSecondaryVariants = cva('', {
  variants: {
    tone: {
      muted: 'text-muted-foreground',
      subtle: 'opacity-80',
    },
  },
  defaultVariants: {
    tone: 'muted',
  },
})
