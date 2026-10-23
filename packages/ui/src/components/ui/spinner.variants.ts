import { cva, type VariantProps } from 'class-variance-authority'

export const spinnerVariants = cva('', {
  variants: {
    variant: {
      muted: 'text-muted-foreground',
      foreground: 'text-foreground',
    },
    size: {
      sm: '',
      default: '',
      lg: '',
      xl: '',
    },
  },
  defaultVariants: {
    variant: 'muted',
    size: 'default',
  },
})

export type SpinnerVariantProps = VariantProps<typeof spinnerVariants>
