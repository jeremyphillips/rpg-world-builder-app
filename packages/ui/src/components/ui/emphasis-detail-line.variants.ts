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
    tone: CONTENT_TONE_SECONDARY_CLASSES,
  },
  defaultVariants: {
    tone: 'secondary',
  },
})
