import { cva } from 'class-variance-authority'

/** Outer row — wider gap before modifier controls and action buttons. */
export const diceFormulaRowVariants = cva('flex flex-wrap items-center gap-2')

/** Tighter cluster for count + d + faces so the separator reads as notation. */
export const diceFormulaCoreVariants = cva('flex shrink-0 items-center gap-1')

export const diceFormulaSeparatorVariants = cva('shrink-0 font-mono font-medium text-foreground', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-base',
      lg: 'text-lg',
    },
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
