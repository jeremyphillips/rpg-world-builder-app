import { cva } from 'class-variance-authority'

import { fieldSizeTypographyClasses } from './field-sizing.variants'
import { fieldInlineSentenceClasses } from './field.variants'

/** Outer row — control segments and action buttons share the inline sentence gap. */
export const diceFormulaRowVariants = cva(fieldInlineSentenceClasses)

/** Tighter cluster for count + d + faces so the separator reads as notation. */
export const diceFormulaCoreVariants = cva('flex shrink-0 items-center gap-1')

export const diceFormulaSeparatorVariants = cva('shrink-0 font-mono font-medium text-foreground', {
  variants: {
    size: fieldSizeTypographyClasses,
  },
  defaultVariants: {
    size: 'sm',
  },
})

export const diceFormulaControlCellVariants = cva('flex shrink-0 items-center')

/**
 * Applied to NumberInput `className` (the `<input>` element). Width is
 * controlled by the `digits` prop on NumberInput itself, not here.
 */
export const diceFormulaCountInputVariants = cva('text-center tabular-nums')

/** Applied to digit-sized SelectTrigger — width comes from the `digits` prop. */
export const diceFormulaSelectTriggerVariants = cva('shrink-0 tabular-nums')

/**
 * Applied to NumberInput `className` (the `<input>` element). Width is
 * controlled by the `digits` prop on NumberInput itself, not here.
 */
export const diceFormulaModifierInputVariants = cva('text-center tabular-nums')
