import { cva } from 'class-variance-authority'

/**
 * Trailing column for digit-sized Select triggers. Mirrors the number-input
 * stepper column: fixed width, border-l, caret centered — no gap beyond pr reserve.
 */
export const selectDigitTrailingColumnVariants = cva(
  'pointer-events-none absolute inset-y-px right-px flex items-center justify-center border-l border-input text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'w-5 [&_svg]:size-2.5',
        md: 'w-6 [&_svg]:size-3',
        lg: 'w-7 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)
