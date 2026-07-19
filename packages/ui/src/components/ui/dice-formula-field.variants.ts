import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldInputFocusWithinClasses,
  fieldInputInvalidClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'
import { fieldGroupedControlSizeClasses } from './field-sizing.variants'
import { fieldInlineSentenceClasses } from './field.variants'

/** Shared bordered shell for grouped dice segments (mirrors InputSelectField group). */
const diceFormulaGroupShellClasses = cn(
  'inline-flex w-fit max-w-full items-center',
  fieldInputShellClasses,
  fieldInputFocusWithinClasses,
)

/** Core cluster shell — count + d + faces. */
export const diceFormulaCoreGroupVariants = cva(diceFormulaGroupShellClasses, {
  variants: {
    invalid: {
      true: fieldInputInvalidClasses,
      false: '',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    invalid: false,
    disabled: false,
  },
})

/** Modifier cluster shell — operator + amount. */
export const diceFormulaModifierGroupVariants = cva(diceFormulaGroupShellClasses, {
  variants: {
    invalid: {
      true: fieldInputInvalidClasses,
      false: '',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    invalid: false,
    disabled: false,
  },
})

/** @deprecated Use `InlineSentenceRow` — kept for grouped segment imports. */
export const diceFormulaRowVariants = cva(fieldInlineSentenceClasses)

export { diceFormulaSeparatorVariants } from './inline-sentence-row.variants'

export const diceFormulaControlCellVariants = cva('flex shrink-0 items-center')

/**
 * Size-only tokens for grouped segments. Suppresses standalone field chrome so
 * the group shell owns border and focus.
 */
const groupedSegmentReset =
  'border-0 bg-transparent shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'

/** Wrapper for the count NumberInput — clips the trailing stepper column. */
export const diceFormulaGroupedCountRootVariants = cva('overflow-hidden rounded-l-md')

/** Wrapper for the modifier NumberInput — clips the trailing stepper column. */
export const diceFormulaGroupedModifierRootVariants = cva('overflow-hidden rounded-r-md')

export const diceFormulaGroupedFacesSegmentVariants = cva('shrink-0 tabular-nums', {
  variants: {
    size: {
      sm: cn(fieldGroupedControlSizeClasses.sm, groupedSegmentReset, 'rounded-l-none rounded-r-md'),
      md: cn(fieldGroupedControlSizeClasses.md, groupedSegmentReset, 'rounded-l-none rounded-r-md'),
      lg: cn(fieldGroupedControlSizeClasses.lg, groupedSegmentReset, 'rounded-l-none rounded-r-md'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const diceFormulaGroupedOperatorSegmentVariants = cva('shrink-0 tabular-nums', {
  variants: {
    size: {
      sm: cn(fieldGroupedControlSizeClasses.sm, groupedSegmentReset, 'rounded-l-md rounded-r-none'),
      md: cn(fieldGroupedControlSizeClasses.md, groupedSegmentReset, 'rounded-l-md rounded-r-none'),
      lg: cn(fieldGroupedControlSizeClasses.lg, groupedSegmentReset, 'rounded-l-md rounded-r-none'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Applied to NumberInput `className` (the `<input>` element). Width is
 * controlled by the `digits` prop on NumberInput itself, not here.
 */
export const diceFormulaCountInputVariants = cva('text-center tabular-nums')

/**
 * Applied to NumberInput `className` (the `<input>` element). Width is
 * controlled by the `digits` prop on NumberInput itself, not here.
 */
export const diceFormulaModifierInputVariants = cva('text-center tabular-nums')

export type DiceFormulaCoreGroupVariantProps = VariantProps<typeof diceFormulaCoreGroupVariants>
export type DiceFormulaModifierGroupVariantProps = VariantProps<
  typeof diceFormulaModifierGroupVariants
>
