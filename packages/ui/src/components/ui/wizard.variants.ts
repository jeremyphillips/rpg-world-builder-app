import { cva } from 'class-variance-authority'

export const wizardStepBubbleVariants = cva(
  [
    'flex size-8 shrink-0 items-center justify-center rounded-full',
    'text-sm font-medium transition-colors duration-150',
  ],
  {
    variants: {
      state: {
        idle: 'border-2 border-border bg-background text-muted-foreground',
        active: 'border-2 border-primary bg-primary text-primary-foreground',
        complete: 'border-2 border-primary bg-surface-subtle text-primary',
      },
    },
    defaultVariants: { state: 'idle' },
  },
)

export const wizardStepLabelVariants = cva(
  'hidden text-sm font-medium sm:block transition-colors duration-150',
  {
    variants: {
      state: {
        idle: 'text-muted-foreground',
        active: 'text-foreground',
        complete: 'text-muted-foreground',
      },
    },
    defaultVariants: { state: 'idle' },
  },
)

export const wizardConnectorVariants = cva('h-px flex-1 transition-colors duration-150', {
  variants: {
    state: {
      idle: 'bg-border',
      complete: 'bg-primary',
    },
  },
  defaultVariants: { state: 'idle' },
})

export const wizardFooterVariants = cva('flex items-center gap-2 pt-4')
