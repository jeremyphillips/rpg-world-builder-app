import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldGroupedDividerClasses,
  fieldGroupedShellClasses,
  fieldGroupedShellStretchLayoutClasses,
  fieldInputInvalidClasses,
} from './field-input-chrome.variants'
import { resolveFieldGroupActionSegmentClasses } from './field-group.styles'

export const inputActionGroupVariants = cva(
  cn(fieldGroupedShellClasses, fieldGroupedShellStretchLayoutClasses),
  {
    variants: {
      size: {
        xs: '',
        sm: '',
        md: '',
        lg: '',
      },
      invalid: {
        true: fieldInputInvalidClasses,
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    compoundVariants: [
      { size: 'xs', class: 'ui-field-group--xs' },
      { size: 'sm', class: 'ui-field-group--sm' },
      { size: 'md', class: 'ui-field-group--md' },
      { size: 'lg', class: 'ui-field-group--lg' },
    ],
    defaultVariants: {
      size: 'md',
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
      xs: resolveFieldGroupActionSegmentClasses('xs'),
      sm: resolveFieldGroupActionSegmentClasses('sm'),
      md: resolveFieldGroupActionSegmentClasses('md'),
      lg: resolveFieldGroupActionSegmentClasses('lg'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type InputActionGroupVariantProps = VariantProps<typeof inputActionGroupVariants>
