import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { interactiveFocusVariants } from './interactive-focus.variants'

/** Button above a failure line. The line is out of flow so the button does not shift. */
export const catalogPickerRowActionVariants = cva('relative inline-flex flex-col items-end')

/** The single tab stop when a disabled action explains itself. */
export const catalogPickerRowActionTooltipTriggerVariants = cva(
  cn('inline-flex rounded-md', interactiveFocusVariants({ context: 'standalone' })),
)

export const catalogPickerRowActionFailureVariants = cva('absolute top-full mt-1 text-end text-xs')
