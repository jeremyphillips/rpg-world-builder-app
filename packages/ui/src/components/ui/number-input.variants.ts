import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldControlVariants } from './field-control.variants'
import { fieldDigitWidthVariants } from './field-digit-metrics'
import {
  fieldDigitTrailingColumnClasses,
  fieldDigitTrailingIconClasses,
  fieldDigitTrailingPaddingClasses,
  fieldGroupedControlSizeClasses,
} from './field-sizing.variants'

export const numberInputRootVariants = cva('group relative inline-flex')

const groupedNumberInputFieldSizeClasses = {
  sm: cn(fieldGroupedControlSizeClasses.sm, fieldDigitTrailingPaddingClasses.sm),
  md: cn(fieldGroupedControlSizeClasses.md, fieldDigitTrailingPaddingClasses.md),
  lg: cn(fieldGroupedControlSizeClasses.lg, fieldDigitTrailingPaddingClasses.lg),
} as const

export const numberInputFieldVariants = cva(
  '[appearance:textfield] tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  {
    variants: {
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      grouped: {
        true: 'border-0 bg-transparent shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0',
        false: '',
      },
    },
    compoundVariants: [
      {
        grouped: false,
        size: 'sm',
        class: cn(fieldControlVariants({ size: 'sm' }), fieldDigitTrailingPaddingClasses.sm),
      },
      {
        grouped: false,
        size: 'md',
        class: cn(fieldControlVariants({ size: 'md' }), fieldDigitTrailingPaddingClasses.md),
      },
      {
        grouped: false,
        size: 'lg',
        class: cn(fieldControlVariants({ size: 'lg' }), fieldDigitTrailingPaddingClasses.lg),
      },
      {
        grouped: true,
        size: 'sm',
        class: groupedNumberInputFieldSizeClasses.sm,
      },
      {
        grouped: true,
        size: 'md',
        class: groupedNumberInputFieldSizeClasses.md,
      },
      {
        grouped: true,
        size: 'lg',
        class: groupedNumberInputFieldSizeClasses.lg,
      },
    ],
    defaultVariants: {
      size: 'md',
      grouped: false,
    },
  },
)

export const numberInputStepperVariants = cva(
  'absolute inset-y-px right-px flex flex-col overflow-hidden border-l border-input bg-background/80',
  {
    variants: {
      size: {
        sm: fieldDigitTrailingColumnClasses.sm,
        md: fieldDigitTrailingColumnClasses.md,
        lg: fieldDigitTrailingColumnClasses.lg,
      },
      grouped: {
        true: 'rounded-none',
        false: 'rounded-r-[calc(var(--radius-md)-1px)]',
      },
    },
    defaultVariants: {
      size: 'md',
      grouped: false,
    },
  },
)

export const numberInputStepperButtonVariants = cva(
  'inline-flex flex-1 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      size: {
        sm: fieldDigitTrailingIconClasses.sm,
        md: fieldDigitTrailingIconClasses.md,
        lg: fieldDigitTrailingIconClasses.lg,
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type NumberInputVariantProps = VariantProps<typeof numberInputFieldVariants>

/** @see fieldDigitWidthVariants — single source of truth for digit-based control widths. */
export const numberInputDigitsVariants = fieldDigitWidthVariants

export type NumberInputDigits = keyof (typeof numberInputDigitsVariants)['md']
