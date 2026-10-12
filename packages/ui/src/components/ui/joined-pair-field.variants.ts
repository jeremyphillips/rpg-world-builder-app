import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldGroupedInputColumnClasses,
  groupedDividerVariants,
  fieldGroupedShellClasses,
  fieldGroupedShellIntrinsicLayoutClasses,
  fieldGroupedShellStretchLayoutClasses,
  fieldInputInvalidClasses,
} from './field-input-chrome.variants'
import {
  resolveFieldGroupInputSegmentClasses,
  UI_FIELD_GROUP_SEGMENT_RESET_CLASS,
  UI_FIELD_GROUP_SEGMENT_START_CLASS,
} from './field-group.styles'

export const joinedPairGroupVariants = cva(fieldGroupedShellClasses, {
  variants: {
    size: {
      xs: 'ui-field-group--xs',
      sm: 'ui-field-group--sm',
      md: 'ui-field-group--md',
      lg: 'ui-field-group--lg',
    },
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
    size: 'md',
    layout: 'intrinsic',
    invalid: false,
    disabled: false,
  },
})

/** Grouped editable start segments (NumberInput / Input value cells). */
export const joinedPairSegmentSizeVariants = {
  xs: resolveFieldGroupInputSegmentClasses('xs'),
  sm: resolveFieldGroupInputSegmentClasses('sm'),
  md: resolveFieldGroupInputSegmentClasses('md'),
  lg: resolveFieldGroupInputSegmentClasses('lg'),
} as const

export const joinedPairStartTextSegmentVariants = cva('min-w-0', {
  variants: {
    size: {
      xs: cn(
        joinedPairSegmentSizeVariants.xs,
        UI_FIELD_GROUP_SEGMENT_RESET_CLASS,
        UI_FIELD_GROUP_SEGMENT_START_CLASS,
      ),
      sm: cn(
        joinedPairSegmentSizeVariants.sm,
        UI_FIELD_GROUP_SEGMENT_RESET_CLASS,
        UI_FIELD_GROUP_SEGMENT_START_CLASS,
      ),
      md: cn(
        joinedPairSegmentSizeVariants.md,
        UI_FIELD_GROUP_SEGMENT_RESET_CLASS,
        UI_FIELD_GROUP_SEGMENT_START_CLASS,
      ),
      lg: cn(
        joinedPairSegmentSizeVariants.lg,
        UI_FIELD_GROUP_SEGMENT_RESET_CLASS,
        UI_FIELD_GROUP_SEGMENT_START_CLASS,
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
