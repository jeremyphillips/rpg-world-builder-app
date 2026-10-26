import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { chipRemovablePaddingClass, chipSizeClass, type ChipSize } from './chip.lib'
import {
  resolveCompactControlIconCompactSmClasses,
  resolveCompactControlRecipeClasses,
} from './compact-control.styles'

export function resolveChipSizeClassName(size: ChipSize, removable = false): string {
  return cn(chipSizeClass(size), removable ? chipRemovablePaddingClass(size) : null)
}

export const chipRemoveButtonVariants = cva('ui-chip__remove ui-focus-ring', {
  variants: {
    size: {
      xs: 'ui-chip__remove--xs',
      sm: resolveCompactControlIconCompactSmClasses(),
      md: resolveCompactControlRecipeClasses('icon-compact'),
      lg: resolveCompactControlRecipeClasses('icon-default'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
