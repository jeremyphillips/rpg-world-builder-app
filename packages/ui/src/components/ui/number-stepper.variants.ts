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
    locked: {
      true: 'bg-sunken',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    bordered: true,
    locked: false,
  },
})

export const numberStepperButtonVariants = cva(
  cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center bg-input text-muted-foreground transition-colors',
    'hover:bg-background active:bg-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    'disabled:pointer-events-none disabled:bg-sunken disabled:text-input-disabled disabled:[&_svg]:text-input-disabled',
  ),
  {
    variants: {
      size: {
        xs: cn('size-6', iconGlyphDescendantClasses.xs),
        sm: cn('size-8', iconGlyphDescendantClasses.sm),
        md: cn('size-8', iconGlyphDescendantClasses.md),
        lg: cn('size-9', iconGlyphDescendantClasses.md),
      },
      minBoundary: {
        default: 'hover:text-primary active:text-primary',
        remove: 'hover:text-destructive active:text-destructive focus-visible:text-destructive',
      },
    },
    defaultVariants: {
      size: 'md',
      minBoundary: 'default',
    },
  },
)

export const numberStepperInputVariants = cva(
  cn(
    'shrink-0 border-y-0 bg-input text-center text-foreground tabular-nums outline-none [appearance:textfield]',
    'border-x border-border-faint',
    '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:ring-0',
  ),
  {
    variants: {
      size: {
        xs: `${fieldControlSizeClasses.sm} h-full px-1.5 text-xs`,
        sm: `${fieldControlSizeClasses.sm} h-full px-1.5`,
        md: `${fieldControlSizeClasses.md} h-full px-1.5`,
        lg: `${fieldControlSizeClasses.lg} h-full px-1.5`,
      },
      locked: {
        true: 'bg-sunken text-input-disabled',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      locked: false,
    },
  },
)

/**
 * Value slot width (px, border-box) per stepper size and digit capacity.
 * Must stay in sync with `numberStepperInputSlotWidthClasses` and root width formula.
 */
export const numberStepperValueSlotWidthPx = {
  xs: { 1: 26, 2: 30, 3: 36, 4: 42, 5: 48 },
  sm: { 1: 28, 2: 32, 3: 38, 4: 44, 5: 50 },
  md: { 1: 30, 2: 36, 3: 42, 4: 48, 5: 54 },
  lg: { 1: 32, 2: 40, 3: 46, 4: 52, 5: 58 },
} as const satisfies Record<NumberStepperSize, Record<1 | 2 | 3 | 4 | 5, number>>

/** Fixed value-slot width per size and digit count — literal classes for Tailwind scanning. */
export const numberStepperInputSlotWidthClasses = {
  xs: {
    1: 'box-border w-[26px] min-w-[26px] max-w-[26px]',
    2: 'box-border w-[30px] min-w-[30px] max-w-[30px]',
    3: 'box-border w-[36px] min-w-[36px] max-w-[36px]',
    4: 'box-border w-[42px] min-w-[42px] max-w-[42px]',
    5: 'box-border w-[48px] min-w-[48px] max-w-[48px]',
  },
  sm: {
    1: 'box-border w-[28px] min-w-[28px] max-w-[28px]',
    2: 'box-border w-[32px] min-w-[32px] max-w-[32px]',
    3: 'box-border w-[38px] min-w-[38px] max-w-[38px]',
    4: 'box-border w-[44px] min-w-[44px] max-w-[44px]',
    5: 'box-border w-[50px] min-w-[50px] max-w-[50px]',
  },
  md: {
    1: 'box-border w-[30px] min-w-[30px] max-w-[30px]',
    2: 'box-border w-[36px] min-w-[36px] max-w-[36px]',
    3: 'box-border w-[42px] min-w-[42px] max-w-[42px]',
    4: 'box-border w-[48px] min-w-[48px] max-w-[48px]',
    5: 'box-border w-[54px] min-w-[54px] max-w-[54px]',
  },
  lg: {
    1: 'box-border w-[32px] min-w-[32px] max-w-[32px]',
    2: 'box-border w-[40px] min-w-[40px] max-w-[40px]',
    3: 'box-border w-[46px] min-w-[46px] max-w-[46px]',
    4: 'box-border w-[52px] min-w-[52px] max-w-[52px]',
    5: 'box-border w-[58px] min-w-[58px] max-w-[58px]',
  },
} as const satisfies Record<NumberStepperSize, Record<1 | 2 | 3 | 4 | 5, string>>

const sideButtonWidthFourRem = '4rem'
const sideButtonWidthThreeRem = '3rem'

function numberStepperRootWidth(valueSlotPx: number, sideButtonsRem: string): string {
  return `w-[calc(${valueSlotPx}px+${sideButtonsRem})]`
}

function numberStepperWidthsForSize(size: NumberStepperSize, sideButtonsRem: string) {
  const slots = numberStepperValueSlotWidthPx[size]
  return {
    1: numberStepperRootWidth(slots[1], sideButtonsRem),
    2: numberStepperRootWidth(slots[2], sideButtonsRem),
    3: numberStepperRootWidth(slots[3], sideButtonsRem),
    4: numberStepperRootWidth(slots[4], sideButtonsRem),
    5: numberStepperRootWidth(slots[5], sideButtonsRem),
  } as const
}

export const numberStepperWidthVariants = {
  xs: numberStepperWidthsForSize('xs', sideButtonWidthThreeRem),
  sm: numberStepperWidthsForSize('sm', sideButtonWidthFourRem),
  md: numberStepperWidthsForSize('md', sideButtonWidthFourRem),
  lg: numberStepperWidthsForSize('lg', sideButtonWidthFourRem),
} as const satisfies Record<NumberStepperSize, Record<1 | 2 | 3 | 4 | 5, string>>

/** Extra border-box width so a leading `+` adornment does not clip the digits. */
export const numberStepperValuePrefixExtraPx = 12

export const numberStepperPrefixedValueSlotWidthPx = {
  xs: { 1: 38, 2: 42, 3: 48, 4: 54, 5: 60 },
  sm: { 1: 40, 2: 44, 3: 50, 4: 56, 5: 62 },
  md: { 1: 42, 2: 48, 3: 54, 4: 60, 5: 66 },
  lg: { 1: 44, 2: 52, 3: 58, 4: 64, 5: 70 },
} as const satisfies Record<NumberStepperSize, Record<1 | 2 | 3 | 4 | 5, number>>

/** Prefixed value-slot width. Literal classes so Tailwind can scan them. */
export const numberStepperPrefixedInputSlotWidthClasses = {
  xs: {
    1: 'box-border w-[38px] min-w-[38px] max-w-[38px]',
    2: 'box-border w-[42px] min-w-[42px] max-w-[42px]',
    3: 'box-border w-[48px] min-w-[48px] max-w-[48px]',
    4: 'box-border w-[54px] min-w-[54px] max-w-[54px]',
    5: 'box-border w-[60px] min-w-[60px] max-w-[60px]',
  },
  sm: {
    1: 'box-border w-[40px] min-w-[40px] max-w-[40px]',
    2: 'box-border w-[44px] min-w-[44px] max-w-[44px]',
    3: 'box-border w-[50px] min-w-[50px] max-w-[50px]',
    4: 'box-border w-[56px] min-w-[56px] max-w-[56px]',
    5: 'box-border w-[62px] min-w-[62px] max-w-[62px]',
  },
  md: {
    1: 'box-border w-[42px] min-w-[42px] max-w-[42px]',
    2: 'box-border w-[48px] min-w-[48px] max-w-[48px]',
    3: 'box-border w-[54px] min-w-[54px] max-w-[54px]',
    4: 'box-border w-[60px] min-w-[60px] max-w-[60px]',
    5: 'box-border w-[66px] min-w-[66px] max-w-[66px]',
  },
  lg: {
    1: 'box-border w-[44px] min-w-[44px] max-w-[44px]',
    2: 'box-border w-[52px] min-w-[52px] max-w-[52px]',
    3: 'box-border w-[58px] min-w-[58px] max-w-[58px]',
    4: 'box-border w-[64px] min-w-[64px] max-w-[64px]',
    5: 'box-border w-[70px] min-w-[70px] max-w-[70px]',
  },
} as const satisfies Record<NumberStepperSize, Record<1 | 2 | 3 | 4 | 5, string>>

function numberStepperPrefixedWidthsForSize(size: NumberStepperSize, sideButtonsRem: string) {
  const slots = numberStepperPrefixedValueSlotWidthPx[size]
  return {
    1: numberStepperRootWidth(slots[1], sideButtonsRem),
    2: numberStepperRootWidth(slots[2], sideButtonsRem),
    3: numberStepperRootWidth(slots[3], sideButtonsRem),
    4: numberStepperRootWidth(slots[4], sideButtonsRem),
    5: numberStepperRootWidth(slots[5], sideButtonsRem),
  } as const
}

export const numberStepperPrefixedWidthVariants = {
  xs: numberStepperPrefixedWidthsForSize('xs', sideButtonWidthThreeRem),
  sm: numberStepperPrefixedWidthsForSize('sm', sideButtonWidthFourRem),
  md: numberStepperPrefixedWidthsForSize('md', sideButtonWidthFourRem),
  lg: numberStepperPrefixedWidthsForSize('lg', sideButtonWidthFourRem),
} as const satisfies Record<NumberStepperSize, Record<1 | 2 | 3 | 4 | 5, string>>

export function numberStepperRootWidthClass(
  size: NumberStepperSize,
  digits: NumberStepperDigits,
  valuePrefix?: '+',
): string {
  const table = valuePrefix ? numberStepperPrefixedWidthVariants : numberStepperWidthVariants
  return table[size][digits]
}

export const numberStepperValuePrefixVariants = cva('pointer-events-none shrink-0 tabular-nums')

export const numberStepperPrefixedSlotVariants = cva('flex items-center justify-center')

export const numberStepperPrefixedInputVariants = cva(
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-center text-inherit outline-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
)

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
