import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldControlVariants } from './field-control.variants'

export const numberInputRootVariants = cva('group relative inline-flex w-full')

export const numberInputFieldVariants = cva(
  '[appearance:textfield] tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  {
    variants: {
      size: {
        sm: cn(fieldControlVariants({ size: 'sm' }), 'pr-6'),
        md: cn(fieldControlVariants({ size: 'md' }), 'pr-7'),
        lg: cn(fieldControlVariants({ size: 'lg' }), 'pr-8'),
      },
    },
    defaultVariants: {
      size: 'md',
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
