import { cva } from 'class-variance-authority'

import { cn } from '@rpg/ui'

export const progressionTierSeparatorLabelVariants = cva('text-center font-medium', {
  variants: {
    variant: {
      preview: 'border-border border-y bg-surface-muted py-2 text-sm',
      values:
        'my-1 border-border border-y bg-surface-subtle py-1.5 text-xs-meta leading-none text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'preview',
  },
})

export const progressionTierSeparatorGridBandClasses = cn(
  progressionTierSeparatorLabelVariants({ variant: 'values' }),
)
