import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldGroupedInputColumnClasses,
  groupedDividerVariants,
  fieldGroupedSegmentResetClasses,
  fieldGroupedSegmentStartClasses,
  fieldGroupedShellClasses,
  fieldGroupedShellIntrinsicLayoutClasses,
  fieldGroupedShellStretchLayoutClasses,
  fieldInputInvalidClasses,
} from './field-input-chrome.variants'
import { fieldGroupedControlSizeClasses } from './field-sizing.variants'

export const joinedPairGroupVariants = cva(fieldGroupedShellClasses, {
  variants: {
    layout: {
      intrinsic: fieldGroupedShellIntrinsicLayoutClasses,
      stretch: fieldGroupedShellStretchLayoutClasses,
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
  defaultVariants: {
    layout: 'intrinsic',
    invalid: false,
    disabled: false,
  },
})

/** Grouped editable start segments (NumberInput / Input value cells). */
export const joinedPairSegmentSizeVariants = fieldGroupedControlSizeClasses

export const joinedPairStartTextSegmentVariants = cva('min-w-0', {
  variants: {
    size: {
      sm: cn(
        joinedPairSegmentSizeVariants.sm,
        fieldGroupedSegmentResetClasses,
        fieldGroupedSegmentStartClasses,
      ),
      md: cn(
        joinedPairSegmentSizeVariants.md,
        fieldGroupedSegmentResetClasses,
        fieldGroupedSegmentStartClasses,
      ),
      lg: cn(
        joinedPairSegmentSizeVariants.lg,
        fieldGroupedSegmentResetClasses,
        fieldGroupedSegmentStartClasses,
      ),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const joinedPairStartNumberWrapperVariants = cva(fieldGroupedInputColumnClasses)

export const joinedPairDividerVariants = groupedDividerVariants

export type JoinedPairGroupVariantProps = VariantProps<typeof joinedPairGroupVariants>
