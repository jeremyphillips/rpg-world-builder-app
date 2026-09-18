import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldInputFocusWithinClasses,
  fieldInputInvalidClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'
import {
  groupedSegmentShellClasses,
  resolveGroupedSegmentSurface,
  type GroupedSurfaceRole,
} from './grouped-segment.variants'
import { fieldInlineSentenceClasses } from './field.variants'
import type { FieldSize } from './field.client'

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

/** Wrapper for the count NumberInput — clips the trailing stepper column. */
export const diceFormulaGroupedCountRootVariants = cva('overflow-hidden rounded-l-md')

/** Wrapper for the modifier NumberInput — clips the trailing stepper column. */
export const diceFormulaGroupedModifierRootVariants = cva('overflow-hidden rounded-r-md')

function diceFormulaGroupedSelectSegmentClasses(
  size: FieldSize,
  position: 'start' | 'end',
  surfaceRole: GroupedSurfaceRole,
): string {
  return cn(
    groupedSegmentShellClasses(size, {
      position,
      surface: resolveGroupedSegmentSurface(surfaceRole),
    }),
    'shrink-0 tabular-nums',
  )
}

export const diceFormulaGroupedFacesSegmentVariants = cva('', {
  variants: {
    size: {
      sm: diceFormulaGroupedSelectSegmentClasses('sm', 'end', 'unit'),
      md: diceFormulaGroupedSelectSegmentClasses('md', 'end', 'unit'),
      lg: diceFormulaGroupedSelectSegmentClasses('lg', 'end', 'unit'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const diceFormulaGroupedOperatorSegmentVariants = cva('', {
  variants: {
    size: {
      sm: diceFormulaGroupedSelectSegmentClasses('sm', 'start', 'value'),
      md: diceFormulaGroupedSelectSegmentClasses('md', 'start', 'value'),
      lg: diceFormulaGroupedSelectSegmentClasses('lg', 'start', 'value'),
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
