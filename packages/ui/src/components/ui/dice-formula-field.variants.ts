import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldGroupedShellClasses, fieldInputInvalidClasses } from './field-input-chrome.variants'
import { fieldInlineSentenceClasses } from './field.variants'

/** Shared bordered shell for grouped dice segments (mirrors JoinedPair group). */
const diceFormulaGroupShellClasses = cn(
  fieldGroupedShellClasses,
  'w-fit min-w-max max-w-full grid-flow-col auto-cols-max',
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
