import { cva, type VariantProps } from 'class-variance-authority'

export const spinnerVariants = cva('animate-spin', {
  variants: {
    variant: {
      muted: 'text-muted-foreground',
      foreground: 'text-foreground',
    },
    size: {
      sm: 'size-3',
      default: 'size-4',
      lg: 'size-6',
      xl: 'size-8',
    },
  },
  defaultVariants: {
    variant: 'muted',
    size: 'default',
  },
})

export type SpinnerVariantProps = VariantProps<typeof spinnerVariants>
