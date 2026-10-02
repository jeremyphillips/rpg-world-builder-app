import { cva, type VariantProps } from 'class-variance-authority'

export const CHOICE_SELECTION_COUNTER_DEFAULT_SIZE = 'md' as const

export type ChoiceSelectionCounterSize = 'sm' | 'md'

/** Maps counter rhythm to StatusIcon size — counter has no `lg` tier. */
export const choiceSelectionCounterStatusIconSize: Record<ChoiceSelectionCounterSize, 'sm' | 'md'> =
  {
    sm: 'sm',
    md: 'md',
  }

export const choiceSelectionCounterVariants = cva('inline-flex items-center', {
  variants: {
    size: {
      sm: 'gap-1',
      md: 'gap-1.5',
    },
  },
  defaultVariants: {
    size: CHOICE_SELECTION_COUNTER_DEFAULT_SIZE,
  },
})

export const choiceSelectionCounterIncompleteLabelVariants = cva('', {
  variants: {
    size: {
      sm: 'text-xs text-muted-foreground',
      md: 'text-sm text-muted-foreground',
    },
  },
  defaultVariants: {
    size: CHOICE_SELECTION_COUNTER_DEFAULT_SIZE,
  },
})

export const choiceSelectionCounterCompleteLabelVariants = cva(
  'font-medium text-semantic-success',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
    },
    defaultVariants: {
      size: CHOICE_SELECTION_COUNTER_DEFAULT_SIZE,
    },
  },
)

export type ChoiceSelectionCounterVariantProps = VariantProps<typeof choiceSelectionCounterVariants>
