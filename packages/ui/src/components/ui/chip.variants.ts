import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { chipRemovablePaddingClass, chipSizeClass, type ChipSize } from './chip.lib'

export function resolveChipSizeClassName(size: ChipSize, removable = false): string {
  return cn(chipSizeClass(size), removable ? chipRemovablePaddingClass(size) : null)
}

export const chipRemoveButtonVariants = cva('ui-chip__remove ui-focus-ring', {
  variants: {
    size: {
      xs: 'ui-chip__remove--xs',
      sm: 'ui-chip__remove--sm',
      md: 'ui-chip__remove--md',
      lg: 'ui-chip__remove--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
