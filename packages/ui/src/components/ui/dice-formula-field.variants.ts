import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldWidthVariants } from './field-control.variants'

export const diceFormulaRowVariants = cva('flex flex-wrap items-center gap-2')

export const diceFormulaSeparatorVariants = cva(
  'shrink-0 font-mono text-xs font-medium text-foreground',
)

export const diceFormulaControlCellVariants = cva('flex shrink-0 items-center')

export const diceFormulaCountInputVariants = cva(
  cn(fieldWidthVariants({ width: 'xs' }), 'text-center tabular-nums'),
)

export const diceFormulaFacesTriggerVariants = cva(
  cn(fieldWidthVariants({ width: 'xs' }), 'tabular-nums'),
)

export const diceFormulaOperatorTriggerVariants = cva(
  cn(fieldWidthVariants({ width: 'xs' }), 'justify-center px-2'),
)

export const diceFormulaModifierInputVariants = cva(
  cn(fieldWidthVariants({ width: 'xs' }), 'text-center tabular-nums'),
)
