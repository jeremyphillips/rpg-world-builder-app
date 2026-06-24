import { cva } from 'class-variance-authority'

export const diceFormulaRowVariants = cva('flex flex-wrap items-center gap-2')

export const diceFormulaSeparatorVariants = cva(
  'shrink-0 font-mono text-xs font-medium text-foreground',
)

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
