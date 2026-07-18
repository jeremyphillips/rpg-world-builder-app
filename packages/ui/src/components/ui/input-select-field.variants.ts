import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  fieldInputFocusWithinClasses,
  fieldInputInvalidClasses,
  fieldInputInvalidSegmentClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'
import { fieldGroupedControlSizeClasses } from './field-sizing.variants'

export const inputSelectGroupVariants = cva(
  cn('grid items-center', fieldInputShellClasses, fieldInputFocusWithinClasses),
  {
    variants: {
      layout: {
        intrinsic: 'w-fit max-w-full grid-cols-[auto_1px_auto]',
        stretch: 'w-full grid-cols-[1fr_1px_auto]',
      },
      invalid: {
        true: cn(fieldInputInvalidClasses, fieldInputInvalidSegmentClasses),
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      layout: 'stretch',
      invalid: false,
      disabled: false,
    },
  },
)

/**
 * Size-only tokens shared by all segments. Uses `pl-*` (not `px-*`) so the
 * right-padding in NumberInput's `numberInputFieldVariants` (pr-6 stepper gap)
 * is never overridden by a later `pr-*` from this object.
 */
export const segmentSizeVariants = fieldGroupedControlSizeClasses

/**
 * Appearance-only reset applied to every segment. Suppresses standalone field
 * chrome and individual focus rings so the group shell owns border and focus.
 */
const segmentReset =
  'border-0 bg-transparent shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'

export const inputSelectValueSegmentVariants = cva('min-w-0', {
  variants: {
    size: {
      sm: cn(segmentSizeVariants.sm, segmentReset, 'rounded-l-md rounded-r-none'),
      md: cn(segmentSizeVariants.md, segmentReset, 'rounded-l-md rounded-r-none'),
      lg: cn(segmentSizeVariants.lg, segmentReset, 'rounded-l-md rounded-r-none'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Wrapper for the NumberInput in the grouped context. Handles left rounding and
 * overflow clipping (so the absolutely-positioned stepper column doesn't escape
 * the group shell). Width is owned by NumberInput's `digits` prop.
 */
export const inputSelectValueWrapperVariants = cva('overflow-hidden rounded-l-md')

export const inputSelectDividerVariants = cva('w-px shrink-0 self-stretch bg-border')

export const inputSelectUnitSegmentVariants = cva(
  'inline-flex shrink-0 items-center justify-between gap-1.5 text-left [&>span]:line-clamp-1 [&_svg]:shrink-0',
  {
    variants: {
      size: {
        sm: cn(segmentSizeVariants.sm, segmentReset, 'rounded-l-none rounded-r-md pl-2 pr-2.5'),
        md: cn(segmentSizeVariants.md, segmentReset, 'rounded-l-none rounded-r-md pl-2.5 pr-3.5'),
        lg: cn(segmentSizeVariants.lg, segmentReset, 'rounded-l-none rounded-r-md pl-3 pr-4'),
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

/** Static unit label segment — no caret, intrinsic width (fixed-unit composites). */
export const inputSelectUnitLabelSegmentVariants = cva(
  'inline-flex w-fit shrink-0 select-none items-center text-foreground',
  {
    variants: {
      size: {
        sm: cn(segmentSizeVariants.sm, segmentReset, 'rounded-l-none rounded-r-md pl-2 pr-2'),
        md: cn(segmentSizeVariants.md, segmentReset, 'rounded-l-none rounded-r-md pl-2.5 pr-2.5'),
        lg: cn(segmentSizeVariants.lg, segmentReset, 'rounded-l-none rounded-r-md pl-3 pr-3'),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type InputSelectGroupVariantProps = VariantProps<typeof inputSelectGroupVariants>
export type InputSelectSegmentVariantProps = VariantProps<typeof inputSelectValueSegmentVariants>
