import { cva, type VariantProps } from 'class-variance-authority'

import { fieldControlSizeClasses } from './field-sizing.variants'

export const numberStepperRootVariants = cva('inline-flex items-center', {
  variants: {
    size: {
      sm: 'h-8',
      md: 'h-9',
    },
    bordered: {
      true: 'overflow-hidden rounded-full border border-input bg-transparent shadow-sm',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    bordered: true,
  },
})

export const numberStepperButtonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      size: {
        sm: 'size-7 [&_svg]:size-3',
        md: 'size-8 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const numberStepperInputVariants = cva(
  'min-w-0 flex-1 border-0 bg-transparent text-center tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:ring-0',
  {
    variants: {
      size: {
        sm: `${fieldControlSizeClasses.sm} h-full px-0`,
        md: `${fieldControlSizeClasses.md} h-full px-0`,
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/**
 * Digit-based stepper widths: N×ch for the value slot plus two side-button columns.
 * Uses `N*1ch` (not `Nch`) to avoid Tailwind `w-5` collision during class detection.
 */
export const numberStepperWidthVariants = {
  sm: {
    1: 'w-[calc(1*1ch+3.25rem)]',
    2: 'w-[calc(2*1ch+3.25rem)]',
    3: 'w-[calc(3*1ch+3.25rem)]',
    4: 'w-[calc(4*1ch+3.25rem)]',
    5: 'w-[calc(5*1ch+3.25rem)]',
  },
  md: {
    1: 'w-[calc(1*1ch+3.75rem)]',
    2: 'w-[calc(2*1ch+3.75rem)]',
    3: 'w-[calc(3*1ch+3.75rem)]',
    4: 'w-[calc(4*1ch+3.75rem)]',
    5: 'w-[calc(5*1ch+3.75rem)]',
  },
} as const satisfies Record<'sm' | 'md', Record<1 | 2 | 3 | 4 | 5, string>>

export type NumberStepperDigits = keyof (typeof numberStepperWidthVariants)['md']

export type NumberStepperVariantProps = VariantProps<typeof numberStepperRootVariants>

export function resolveNumberStepperSize(size: NumberStepperVariantProps['size']): 'sm' | 'md' {
  return size === 'sm' ? 'sm' : 'md'
}
