import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldGroupedDividerClasses,
  fieldGroupedInputColumnClasses,
  fieldGroupedSegmentEndClasses,
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

export const joinedPairDividerVariants = cva(fieldGroupedDividerClasses)

export const joinedPairEndSelectSegmentVariants = cva(
  'inline-flex shrink-0 items-center justify-between gap-1.5 text-left [&>span]:line-clamp-1 [&_svg]:shrink-0',
  {
    variants: {
      size: {
        sm: cn(
          joinedPairSegmentSizeVariants.sm,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-2 pr-2.5',
        ),
        md: cn(
          joinedPairSegmentSizeVariants.md,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-2.5 pr-3.5',
        ),
        lg: cn(
          joinedPairSegmentSizeVariants.lg,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-3 pr-4',
        ),
      },
    },
    defaultVariants: {
      size: 'md',
    },
    compoundVariants: [
      { size: 'sm', class: 'min-w-[4.75rem]' },
      { size: 'md', class: 'min-w-[5rem]' },
      { size: 'lg', class: 'min-w-[5.75rem]' },
    ],
  },
)

export const joinedPairStartSelectSegmentVariants = cva(
  'inline-flex shrink-0 items-center justify-between gap-1.5 text-left [&>span]:line-clamp-1 [&_svg]:shrink-0',
  {
    variants: {
      size: {
        sm: cn(
          joinedPairSegmentSizeVariants.sm,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentStartClasses,
          'pl-2 pr-2.5',
        ),
        md: cn(
          joinedPairSegmentSizeVariants.md,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentStartClasses,
          'pl-2.5 pr-3.5',
        ),
        lg: cn(
          joinedPairSegmentSizeVariants.lg,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentStartClasses,
          'pl-3 pr-4',
        ),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

/** Fixed end label — no caret, intrinsic width. */
export const joinedPairEndLabelSegmentVariants = cva(
  'inline-flex w-fit shrink-0 select-none items-center text-foreground',
  {
    variants: {
      size: {
        sm: cn(
          joinedPairSegmentSizeVariants.sm,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-2 pr-2',
        ),
        md: cn(
          joinedPairSegmentSizeVariants.md,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-2.5 pr-2.5',
        ),
        lg: cn(
          joinedPairSegmentSizeVariants.lg,
          fieldGroupedSegmentResetClasses,
          fieldGroupedSegmentEndClasses,
          'pl-3 pr-3',
        ),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type JoinedPairGroupVariantProps = VariantProps<typeof joinedPairGroupVariants>
