import { cva, type VariantProps } from 'class-variance-authority'

export const statusDotVariants = cva('inline-block shrink-0 rounded-full', {
  variants: {
    tone: {
      neutral: 'bg-semantic-neutral',
      info: 'bg-semantic-info',
      success: 'bg-semantic-success',
      warning: 'bg-semantic-warning',
      destructive: 'bg-semantic-destructive',
    },
    size: {
      sm: 'size-2',
      md: 'size-2.5',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    size: 'sm',
  },
})

export type StatusDotVariantProps = VariantProps<typeof statusDotVariants>
