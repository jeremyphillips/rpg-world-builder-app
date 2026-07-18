import { cva } from 'class-variance-authority'

/** Brief focus/attention chrome for regions that need user attention after a parent choice. */
export const attentionFrameVariants = cva(
  'rounded-md border border-transparent transition-colors',
  {
    variants: {
      active: {
        true: 'border-primary bg-control-selected ring-1 ring-primary/20 motion-safe:animate-attention-ring',
        false: 'border-transparent',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)
