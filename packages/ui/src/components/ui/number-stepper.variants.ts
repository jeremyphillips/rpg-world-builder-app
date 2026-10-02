import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type { FieldSizeToken } from './field-sizing.variants'
import { fieldControlSizeClasses } from './field-sizing.variants'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'

export type NumberStepperSize = 'xs' | 'sm' | 'md' | 'lg'

export const numberStepperRootVariants = cva('inline-flex items-center', {
  variants: {
    size: {
      xs: 'h-6',
      sm: 'h-8',
      md: 'h-9',
      lg: 'h-10',
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
  'inline-flex shrink-0 cursor-pointer items-center justify-center bg-input text-muted-foreground transition-colors hover:bg-input hover:text-primary active:bg-input active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      size: {
        xs: cn('size-6', iconGlyphDescendantClasses.xs),
        sm: cn('size-8', iconGlyphDescendantClasses.sm),
        md: cn('size-8', iconGlyphDescendantClasses.md),
        lg: cn('size-9', iconGlyphDescendantClasses.md),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const numberStepperInputVariants = cva(
  'shrink-0 border-0 bg-input text-center text-foreground tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:ring-0',
  {
    variants: {
      size: {
        xs: `${fieldControlSizeClasses.sm} h-full px-0 text-xs`,
        sm: `${fieldControlSizeClasses.sm} h-full px-0`,
        md: `${fieldControlSizeClasses.md} h-full px-0`,
        lg: `${fieldControlSizeClasses.lg} h-full px-0`,
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/** Fixed value-slot width per digit count — must stay in sync with root width formula. */
export const numberStepperInputDigitWidths = {
  1: 'w-[1ch] min-w-[1ch]',
  2: 'w-[2ch] min-w-[2ch]',
  3: 'w-[3ch] min-w-[3ch]',
  4: 'w-[4ch] min-w-[4ch]',
  5: 'w-[5ch] min-w-[5ch]',
} as const satisfies Record<1 | 2 | 3 | 4 | 5, string>

const sideButtonWidthFourRem = '4rem'
const sideButtonWidthThreeRem = '3rem'

/**
 * Digit-based stepper widths: N×ch for the value slot plus two side-button columns.
 */
export const numberStepperWidthVariants = {
  xs: {
    1: `w-[calc(1*1ch+${sideButtonWidthThreeRem})]`,
    2: `w-[calc(2*1ch+${sideButtonWidthThreeRem})]`,
    3: `w-[calc(3*1ch+${sideButtonWidthThreeRem})]`,
    4: `w-[calc(4*1ch+${sideButtonWidthThreeRem})]`,
    5: `w-[calc(5*1ch+${sideButtonWidthThreeRem})]`,
  },
  sm: {
    1: `w-[calc(1*1ch+${sideButtonWidthFourRem})]`,
    2: `w-[calc(2*1ch+${sideButtonWidthFourRem})]`,
    3: `w-[calc(3*1ch+${sideButtonWidthFourRem})]`,
    4: `w-[calc(4*1ch+${sideButtonWidthFourRem})]`,
    5: `w-[calc(5*1ch+${sideButtonWidthFourRem})]`,
  },
  md: {
    1: `w-[calc(1*1ch+${sideButtonWidthFourRem})]`,
    2: `w-[calc(2*1ch+${sideButtonWidthFourRem})]`,
    3: `w-[calc(3*1ch+${sideButtonWidthFourRem})]`,
    4: `w-[calc(4*1ch+${sideButtonWidthFourRem})]`,
    5: `w-[calc(5*1ch+${sideButtonWidthFourRem})]`,
  },
  lg: {
    1: `w-[calc(1*1ch+${sideButtonWidthFourRem})]`,
    2: `w-[calc(2*1ch+${sideButtonWidthFourRem})]`,
    3: `w-[calc(3*1ch+${sideButtonWidthFourRem})]`,
    4: `w-[calc(4*1ch+${sideButtonWidthFourRem})]`,
    5: `w-[calc(5*1ch+${sideButtonWidthFourRem})]`,
  },
} as const satisfies Record<NumberStepperSize, Record<1 | 2 | 3 | 4 | 5, string>>

export type NumberStepperDigits = keyof (typeof numberStepperWidthVariants)['md']

export type NumberStepperVariantProps = VariantProps<typeof numberStepperRootVariants>

/** Maps field control scale to stepper tier — never resolves to `xs`. */
export function resolveNumberStepperSizeFromFieldSize(
  fieldSize: FieldSizeToken,
): NumberStepperSize {
  if (fieldSize === 'sm') return 'sm'
  if (fieldSize === 'lg') return 'lg'
  return 'md'
}

export function resolveNumberStepperSize(
  explicit: NumberStepperVariantProps['size'],
  fieldSize: FieldSizeToken,
): NumberStepperSize {
  if (explicit) return explicit
  return resolveNumberStepperSizeFromFieldSize(fieldSize)
}
