import type { FieldSizeToken } from './field-sizing.variants'
import { fieldDigitSizeClasses } from './field-sizing.variants'

/**
 * Shared digit-field layout tokens. Number inputs and digit-sized selects use
 * the same width formula: N×ch + padding-left + trailing-column reserve + buffer.
 *
 * Trailing column width matches `numberInputStepperVariants` (w-5 for sm/md, w-7 for lg).
 * Right padding (pr-6 for sm/md, pr-8 for lg) reserves that column; the caret sits inside
 * it with no extra gap to the trigger edge.
 */
export const fieldDigitSizeVariants = fieldDigitSizeClasses

/**
 * Digit-based control widths as literal Tailwind classes so the scanner emits every
 * variant. Uses `N*1ch` (not `Nch`) so digit 5 does not collide with the `w-5`
 * spacing scale during class detection or merge.
 */
export const fieldDigitWidthVariants = {
  sm: {
    1: 'w-[calc(1*1ch+2.625rem)]',
    2: 'w-[calc(2*1ch+2.625rem)]',
    3: 'w-[calc(3*1ch+2.625rem)]',
    4: 'w-[calc(4*1ch+2.625rem)]',
    5: 'w-[calc(5*1ch+2.625rem)]',
  },
  md: {
    1: 'w-[calc(1*1ch+2.75rem)]',
    2: 'w-[calc(2*1ch+2.75rem)]',
    3: 'w-[calc(3*1ch+2.75rem)]',
    4: 'w-[calc(4*1ch+2.75rem)]',
    5: 'w-[calc(5*1ch+2.75rem)]',
  },
  lg: {
    1: 'w-[calc(1*1ch+3.5rem)]',
    2: 'w-[calc(2*1ch+3.5rem)]',
    3: 'w-[calc(3*1ch+3.5rem)]',
    4: 'w-[calc(4*1ch+3.5rem)]',
    5: 'w-[calc(5*1ch+3.5rem)]',
  },
} as const satisfies Record<FieldSizeToken, Record<1 | 2 | 3 | 4 | 5, string>>

export type FieldDigits = keyof (typeof fieldDigitWidthVariants)['md']

/** Maps a numeric maximum (e.g. countMax, largest die face) to a digit slot count. */
export function fieldDigitsForMax(max: number): FieldDigits {
  if (max <= 9) return 1
  if (max <= 99) return 2
  return 3
}
