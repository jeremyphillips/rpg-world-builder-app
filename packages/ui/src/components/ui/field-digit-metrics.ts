import type { FieldControlVariantProps } from './field-control.variants'

type FieldSize = NonNullable<FieldControlVariantProps['size']>

/**
 * Shared digit-field layout tokens. Number inputs and digit-sized selects use
 * the same width formula: N×ch + padding-left + trailing-column reserve + buffer.
 *
 * Trailing column width matches `numberInputStepperVariants` (w-5 / w-6 / w-7).
 * Right padding (pr-6 / pr-7 / pr-8) reserves that column; the caret sits inside
 * it with no extra gap to the trigger edge.
 */
export const fieldDigitSizeVariants = {
  sm: 'pl-2.5 pr-6',
  md: 'pl-3.5 pr-7',
  lg: 'pl-4 pr-8',
} as const satisfies Record<FieldSize, string>

/** Per-size offset (rem) = pl + pr + 0.5rem rendering buffer. */
const fieldDigitOffsetRem = {
  sm: '2.625rem',
  md: '3.125rem',
  lg: '3.5rem',
} as const satisfies Record<FieldSize, string>

function fieldDigitWidthClass(size: FieldSize, digits: number): string {
  return `w-[calc(${digits}ch+${fieldDigitOffsetRem[size]})]`
}

export const fieldDigitWidthVariants = {
  sm: {
    1: fieldDigitWidthClass('sm', 1),
    2: fieldDigitWidthClass('sm', 2),
    3: fieldDigitWidthClass('sm', 3),
    4: fieldDigitWidthClass('sm', 4),
  },
  md: {
    1: fieldDigitWidthClass('md', 1),
    2: fieldDigitWidthClass('md', 2),
    3: fieldDigitWidthClass('md', 3),
    4: fieldDigitWidthClass('md', 4),
  },
  lg: {
    1: fieldDigitWidthClass('lg', 1),
    2: fieldDigitWidthClass('lg', 2),
    3: fieldDigitWidthClass('lg', 3),
    4: fieldDigitWidthClass('lg', 4),
  },
} as const

export type FieldDigits = keyof (typeof fieldDigitWidthVariants)['md']

/** Maps a numeric maximum (e.g. countMax, largest die face) to a digit slot count. */
export function fieldDigitsForMax(max: number): FieldDigits {
  if (max <= 9) return 1
  if (max <= 99) return 2
  return 3
}
