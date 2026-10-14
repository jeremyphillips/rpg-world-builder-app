import { cva } from 'class-variance-authority'

import { cn } from '@rpg/ui'

export const abilityScoreCardVariants = cva(
  cn('rounded-md bg-card text-center transition-colors'),
  {
    variants: {
      state: {
        resting: 'border border-border bg-card',
        dragOver: 'border border-dashed border-primary bg-card ring-2 ring-primary/30',
        draggingFrom: 'border border-dashed border-muted-foreground/40 bg-surface-muted',
        invalid: 'border border-destructive bg-card ring-2 ring-destructive/30',
      },
      size: {
        sm: '',
        md: '',
      },
      restingHover: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        state: 'resting',
        restingHover: true,
        className: 'hover:border-foreground',
      },
    ],
    defaultVariants: {
      state: 'resting',
      size: 'md',
      restingHover: false,
    },
  },
)

export const abilityScoreCardBodyPaddingClasses = {
  sm: 'p-2',
  md: 'p-3',
} as const

export const abilityScoreCardHeaderClasses = 'relative px-6 text-sm font-semibold text-center'

export const abilityScoreCardHeaderAdornmentClasses = 'absolute right-0 top-0'

export const abilityScoreCardScoreRowClasses = 'grid grid-cols-[1fr_4.5ch_1fr] items-center'

export const abilityScoreCardScoreCenterClasses = 'w-[4.5ch] tabular-nums text-center'

export const abilityScoreCardScoreValueClasses = {
  sm: 'heading-style-section font-semibold tabular-nums',
  md: 'heading-style-page font-semibold tabular-nums',
} as const

export const abilityScoreCardModifierClasses = 'text-style-label tabular-nums text-muted-foreground'

export const abilityScoreCardFooterClasses = 'border-t border-border px-2 py-1.5'

export const abilityScoreCardStepperStackClasses = 'flex flex-col gap-0.5'

export type AbilityScoreCardState = 'resting' | 'dragOver' | 'draggingFrom' | 'invalid'
