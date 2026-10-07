import { cva } from 'class-variance-authority'

export const equipmentPickerRowControlStatusVariants = cva('text-sm')

/** Wraps a disabled action so its tooltip can receive pointer and keyboard focus. */
export const equipmentPickerRowControlTooltipTriggerVariants = cva('inline-flex')
