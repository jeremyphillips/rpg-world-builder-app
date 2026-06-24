import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldWidthVariants } from './field-control.variants'

export const diceFormulaRowVariants = cva('flex flex-wrap items-end gap-2')

export const diceFormulaSeparatorVariants = cva(
  'shrink-0 pb-2.5 font-mono text-sm font-medium text-foreground',
)

export const diceFormulaCountInputVariants = cva(
  cn(fieldWidthVariants({ width: 'xs' }), 'text-center'),
)

export const diceFormulaFacesTriggerVariants = cva(fieldWidthVariants({ width: 'sm' }))

export const diceFormulaOperatorTriggerVariants = cva(
  cn(fieldWidthVariants({ width: 'xs' }), 'justify-center px-2'),
)

export const diceFormulaModifierInputVariants = cva(
  cn(fieldWidthVariants({ width: 'xs' }), 'text-center'),
)
