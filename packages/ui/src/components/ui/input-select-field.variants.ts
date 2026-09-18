import { cva, type VariantProps } from 'class-variance-authority'

import {
  joinedPairDividerVariants,
  joinedPairGroupVariants,
  joinedPairSegmentSizeVariants,
  joinedPairStartNumberWrapperVariants,
  joinedPairStartTextSegmentVariants,
} from './joined-pair-field.variants'

/** @deprecated Prefer `joinedPairGroupVariants` — retained for dice-formula and legacy imports. */
export const inputSelectGroupVariants = joinedPairGroupVariants

/** @deprecated Prefer `joinedPairSegmentSizeVariants`. */
export const segmentSizeVariants = joinedPairSegmentSizeVariants

/** @deprecated Prefer `joinedPairStartTextSegmentVariants`. */
export const inputSelectValueSegmentVariants = joinedPairStartTextSegmentVariants

/** @deprecated Prefer `joinedPairStartNumberWrapperVariants`. */
export const inputSelectValueWrapperVariants = joinedPairStartNumberWrapperVariants

/** @deprecated Prefer `joinedPairDividerVariants`. */
export const inputSelectDividerVariants = joinedPairDividerVariants

/** Searchable unit trigger width policy — lives on the segment shell, not ValueSlot padding. */
export const inputSelectSearchableUnitShellWidthVariants = cva('', {
  variants: {
    size: {
      sm: 'min-w-44 max-w-56',
      md: 'min-w-44 max-w-60',
      lg: 'min-w-52 max-w-72',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const inputSelectSearchablePanelVariants = cva('min-w-56')

export type InputSelectGroupVariantProps = VariantProps<typeof inputSelectGroupVariants>
export type InputSelectSegmentVariantProps = VariantProps<typeof inputSelectValueSegmentVariants>
