import { cva } from 'class-variance-authority'

import {
  fieldDigitTrailingColumnClasses,
  fieldDigitTrailingIconClasses,
} from './field-sizing.variants'
import { cn } from '../../lib/utils'

/**
 * Trailing column for digit-sized Select triggers. Mirrors the number-input
 * stepper column width; caret centered — no gap beyond pr reserve.
 */
export const selectDigitTrailingColumnVariants = cva(
  'pointer-events-none absolute inset-y-px right-px flex items-center justify-center text-muted-foreground',
  {
    variants: {
      size: {
        sm: cn(fieldDigitTrailingColumnClasses.sm, fieldDigitTrailingIconClasses.sm),
        md: cn(fieldDigitTrailingColumnClasses.md, fieldDigitTrailingIconClasses.md),
        lg: cn(fieldDigitTrailingColumnClasses.lg, fieldDigitTrailingIconClasses.lg),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)
