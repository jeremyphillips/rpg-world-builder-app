import { cva, type VariantProps } from 'class-variance-authority'

export const mediaImageVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground',
  {
    variants: {
      shape: {
        square: 'rounded-md',
        circle: 'rounded-full',
      },
      size: {
        sm: 'size-12',
        md: 'size-16',
        lg: 'size-24',
      },
    },
    defaultVariants: {
      shape: 'square',
      size: 'md',
    },
  },
)

export type MediaImageVariantProps = VariantProps<typeof mediaImageVariants>

export const mediaImagePlaceholderVariants = cva('size-full', {
  variants: {
    tone: {
      neutral: 'bg-muted',
      error: 'bg-destructive-subtle text-destructive',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})
