import { cva } from 'class-variance-authority'

/** Brief focus/attention chrome for regions that need user attention after a parent choice. */
export const attentionFrameVariants = cva('rounded-md border transition-colors', {
  variants: {
    active: {
      true: 'border-primary bg-accent/20 ring-1 ring-primary/20 motion-safe:animate-attention-ring',
      false: 'border-border bg-transparent',
    },
  },
  defaultVariants: {
    active: false,
  },
})
