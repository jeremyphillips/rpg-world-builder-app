import { cva } from 'class-variance-authority'

import type { ContentTone } from './visual-vocabulary.types'

export const emphasisDetailLineRootVariants = cva('')

export const emphasisDetailLinePrimaryVariants = cva('font-body-emphasis tabular-nums')

const CONTENT_TONE_SECONDARY_CLASSES: Record<
  Extract<ContentTone, 'secondary' | 'disabled'>,
  string
> = {
  secondary: 'text-muted-foreground',
  disabled: 'text-muted-foreground opacity-80',
}

export const emphasisDetailLineSecondaryVariants = cva('', {
  variants: {
    tone: {
      secondary: CONTENT_TONE_SECONDARY_CLASSES.secondary,
      disabled: CONTENT_TONE_SECONDARY_CLASSES.disabled,
      /** @deprecated Use `secondary` */
      muted: CONTENT_TONE_SECONDARY_CLASSES.secondary,
      /** @deprecated Use `disabled` inside tinted parents */
      subtle: CONTENT_TONE_SECONDARY_CLASSES.disabled,
    },
  },
  defaultVariants: {
    tone: 'secondary',
  },
})
