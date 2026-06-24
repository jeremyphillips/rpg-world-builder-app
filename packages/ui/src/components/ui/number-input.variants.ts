import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldControlVariants } from './field-control.variants'

export const numberInputRootVariants = cva('group relative inline-flex w-full')

const groupedNumberInputFieldSizeClasses = {
  sm: 'h-8 pl-2.5 py-1 text-xs pr-6',
  md: 'h-10 pl-3.5 py-2 text-base pr-7',
  lg: 'h-13 pl-4 py-2.5 text-lg pr-8',
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
        class: cn(fieldControlVariants({ size: 'sm' }), 'pr-6'),
      },
      {
        grouped: false,
        size: 'md',
        class: cn(fieldControlVariants({ size: 'md' }), 'pr-7'),
      },
      {
        grouped: false,
        size: 'lg',
        class: cn(fieldControlVariants({ size: 'lg' }), 'pr-8'),
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
        sm: 'w-5',
        md: 'w-6',
        lg: 'w-7',
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
        sm: '[&_svg]:size-2.5',
        md: '[&_svg]:size-3',
        lg: '[&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type NumberInputVariantProps = VariantProps<typeof numberInputFieldVariants>

/**
 * Width classes for number inputs sized to hold a fixed maximum digit count.
 * Uses `ch` units (width of "0" in the current font) so the width scales with
 * font-size automatically — no compound size variants needed for that axis.
 *
 * The per-size offset = padding-left + right-padding reserved for the stepper
 * + 0.5rem rendering buffer (font variance / sub-pixel rounding):
 *   sm → pl-2.5 (0.625rem) + pr-6 (1.5rem)  + 0.5rem = 2.625rem
 *   md → pl-3.5 (0.875rem) + pr-7 (1.75rem) + 0.5rem = 3.125rem
 *   lg → pl-4   (1rem)     + pr-8 (2rem)    + 0.5rem = 3.5rem
 */
export const numberInputDigitsVariants = {
  sm: {
    1: 'w-[calc(1ch+2.625rem)]',
    2: 'w-[calc(2ch+2.625rem)]',
    3: 'w-[calc(3ch+2.625rem)]',
    4: 'w-[calc(4ch+2.625rem)]',
  },
  md: {
    1: 'w-[calc(1ch+3.125rem)]',
    2: 'w-[calc(2ch+3.125rem)]',
    3: 'w-[calc(3ch+3.125rem)]',
    4: 'w-[calc(4ch+3.125rem)]',
  },
  lg: {
    1: 'w-[calc(1ch+3.5rem)]',
    2: 'w-[calc(2ch+3.5rem)]',
    3: 'w-[calc(3ch+3.5rem)]',
    4: 'w-[calc(4ch+3.5rem)]',
  },
} as const

export type NumberInputDigits = keyof (typeof numberInputDigitsVariants)['md']
