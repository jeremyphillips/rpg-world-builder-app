import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'

/** Section band above grouped list rows — hosts own listbox group / nav section semantics. */
export const listGroupHeadingVariants = cva(cn('ui-list-group-heading', borderStrength('subtle')), {
  variants: {
    first: {
      true: 'ui-list-group-heading--first',
      false: '',
    },
    follows: {
      none: '',
      complete: 'ui-list-group-heading--follows-complete',
      truncated: '',
    },
  },
  defaultVariants: {
    first: false,
    follows: 'none',
  },
})

export type ListGroupHeadingVariantProps = VariantProps<typeof listGroupHeadingVariants>
