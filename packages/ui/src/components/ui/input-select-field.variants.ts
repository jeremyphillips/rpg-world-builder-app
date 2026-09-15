import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldGroupedSegmentEndClasses,
  fieldGroupedSegmentResetClasses,
} from './field-input-chrome.variants'
import {
  joinedPairDividerVariants,
  joinedPairEndLabelSegmentVariants,
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

export const inputSelectUnitSegmentVariants = cva(
  'inline-flex shrink-0 items-center justify-between gap-1.5 text-left [&>span]:line-clamp-1 [&_svg]:shrink-0',
  {
    variants: {
      size: {
        sm: cn(
          segmentSizeVariants.sm,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-2 pr-2.5',
        ),
        md: cn(
          segmentSizeVariants.md,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-2.5 pr-3.5',
        ),
        lg: cn(
          segmentSizeVariants.lg,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-3 pr-4',
        ),
      },
      searchable: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        searchable: false,
        size: 'sm',
        class: 'min-w-[4.75rem]',
      },
      {
        searchable: false,
        size: 'md',
        class: 'min-w-[5rem]',
      },
      {
        searchable: false,
        size: 'lg',
        class: 'min-w-[5.75rem]',
      },
      {
        searchable: true,
        size: 'sm',
        class: 'min-w-44 max-w-56',
      },
      {
        searchable: true,
        size: 'md',
        class: 'min-w-44 max-w-60',
      },
      {
        searchable: true,
        size: 'lg',
        class: 'min-w-52 max-w-72',
      },
    ],
    defaultVariants: {
      size: 'md',
      searchable: false,
    },
  },
)

export const inputSelectSearchablePanelVariants = cva('min-w-56')

/** @deprecated Prefer `joinedPairEndLabelSegmentVariants`. */
export const inputSelectUnitLabelSegmentVariants = joinedPairEndLabelSegmentVariants

export type InputSelectGroupVariantProps = VariantProps<typeof inputSelectGroupVariants>
export type InputSelectSegmentVariantProps = VariantProps<typeof inputSelectValueSegmentVariants>
