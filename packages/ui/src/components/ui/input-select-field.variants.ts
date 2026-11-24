import { cva, type VariantProps } from 'class-variance-authority'

import {
  joinedPairGroupVariants,
  joinedPairStartTextSegmentVariants,
} from './joined-pair-field.variants'

/** Searchable unit trigger width policy — lives on the segment shell, not ValueSlot padding. */
export const inputSelectSearchableUnitShellWidthVariants = cva('', {
  variants: {
    size: {
      xs: 'min-w-40 max-w-52',
      sm: 'min-w-44 max-w-56',
      md: 'min-w-44 max-w-60',
      lg: 'min-w-52 max-w-72',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type InputSelectGroupVariantProps = VariantProps<typeof joinedPairGroupVariants>
export type InputSelectSegmentVariantProps = VariantProps<typeof joinedPairStartTextSegmentVariants>
