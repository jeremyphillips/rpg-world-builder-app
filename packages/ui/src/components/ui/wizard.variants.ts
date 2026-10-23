import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'

export const wizardStepBubbleVariants = cva('ui-wizard__bubble', {
  variants: {
    state: {
      idle: cn('ui-wizard__bubble--idle', borderStrength('default')),
      active: 'ui-wizard__bubble--active',
      complete: 'ui-wizard__bubble--complete',
    },
  },
  defaultVariants: { state: 'idle' },
})

export const wizardStepLabelVariants = cva(cn('ui-wizard__label', 'text-style-label'), {
  variants: {
    state: {
      idle: 'ui-wizard__label--idle',
      active: 'ui-wizard__label--active',
      complete: 'ui-wizard__label--complete',
    },
  },
  defaultVariants: { state: 'idle' },
})

export const wizardConnectorVariants = cva('ui-wizard__connector', {
  variants: {
    state: {
      idle: cn('ui-wizard__connector--idle', borderStrength('default')),
      complete: 'ui-wizard__connector--complete',
    },
  },
  defaultVariants: { state: 'idle' },
})
