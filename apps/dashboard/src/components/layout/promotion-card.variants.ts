import { cva } from 'class-variance-authority'

export const promotionCardRootVariants = cva('rounded-lg border p-4', {
  variants: {
    tone: {
      default: 'border-border bg-card',
      warning: 'border-warning-muted bg-warning-subtle text-foreground',
    },
    emphasis: {
      default: '',
      subtle: 'bg-muted',
    },
  },
  compoundVariants: [
    {
      tone: 'warning',
      emphasis: 'subtle',
      className: 'bg-warning-subtle',
    },
  ],
  defaultVariants: {
    tone: 'default',
    emphasis: 'default',
  },
})

export const promotionCardTitleVariants = cva('font-body-emphasis text-foreground', {
  variants: {
    tone: {
      default: '',
      warning: '',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})
