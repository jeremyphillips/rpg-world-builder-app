import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldGroupedDividerClasses,
  fieldGroupedShellClasses,
  fieldGroupedShellStretchLayoutClasses,
  fieldInputInvalidClasses,
} from './field-input-chrome.variants'
import { fieldGroupedControlHeightClasses } from './field-sizing.variants'

export const inputActionGroupVariants = cva(
  cn(fieldGroupedShellClasses, fieldGroupedShellStretchLayoutClasses),
  {
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
  },
)

export const inputActionGroupDividerVariants = cva(fieldGroupedDividerClasses)

/**
 * Action segment shell — height and clip only. Padding, radius, and interactive
 * chrome live on the slotted attached `Button`.
 */
export const inputActionGroupActionSegmentVariants = cva('shrink-0 overflow-hidden', {
  variants: {
    size: {
      sm: fieldGroupedControlHeightClasses.sm,
      md: fieldGroupedControlHeightClasses.md,
      lg: fieldGroupedControlHeightClasses.lg,
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type InputActionGroupVariantProps = VariantProps<typeof inputActionGroupVariants>
