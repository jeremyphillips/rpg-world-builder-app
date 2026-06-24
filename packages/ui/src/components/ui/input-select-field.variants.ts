import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

export const inputSelectGroupVariants = cva(
  'grid w-full grid-cols-[1fr_1px_auto] overflow-hidden rounded-md border border-input bg-transparent shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background dark:bg-input/30',
  {
    variants: {
      invalid: {
        true: 'border-destructive focus-within:ring-destructive [&_[data-input-select-value]]:bg-destructive/5',
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

/**
 * Size-only tokens shared by all segments. Uses `pl-*` (not `px-*`) so the
 * right-padding in NumberInput's `numberInputFieldVariants` (pr-7 stepper gap)
 * is never overridden by a later `pr-*` from this object.
 */
export const segmentSizeVariants = {
  sm: 'h-8 pl-2.5 py-1 text-xs',
  md: 'h-10 pl-3.5 py-2 text-base',
  lg: 'h-13 pl-4 py-2.5 text-lg',
} as const

/**
 * Appearance-only reset applied to every segment. Suppresses any inherited
 * outline or ring so focus is handled exclusively by the group shell's
 * `focus-within` ring.
 */
const segmentReset =
  'bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'

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
 * the group shell). Grid `1fr` handles the column width; an optional `digits`
 * variant sets a `min-w` floor using the same ch-based formula as
 * `numberInputDigitsVariants` so widths stay consistent across contexts.
 *
 * min-w offset per size = padding-left + right-padding for stepper
 * + 0.5rem rendering buffer (matches numberInputDigitsVariants offsets):
 *   sm → pl-2.5 (0.625rem) + pr-6 (1.5rem)  + 0.5rem = 2.625rem
 *   md → pl-3.5 (0.875rem) + pr-7 (1.75rem) + 0.5rem = 3.125rem
 *   lg → pl-4   (1rem)     + pr-8 (2rem)    + 0.5rem = 3.5rem
 */
export const inputSelectValueWrapperVariants = cva('overflow-hidden rounded-l-md', {
  variants: {
    size: { sm: '', md: '', lg: '' },
    digits: { 1: '', 2: '', 3: '', 4: '' },
  },
  compoundVariants: [
    { size: 'sm', digits: 1, class: 'min-w-[calc(1ch+2.625rem)]' },
    { size: 'sm', digits: 2, class: 'min-w-[calc(2ch+2.625rem)]' },
    { size: 'sm', digits: 3, class: 'min-w-[calc(3ch+2.625rem)]' },
    { size: 'sm', digits: 4, class: 'min-w-[calc(4ch+2.625rem)]' },
    { size: 'md', digits: 1, class: 'min-w-[calc(1ch+3.125rem)]' },
    { size: 'md', digits: 2, class: 'min-w-[calc(2ch+3.125rem)]' },
    { size: 'md', digits: 3, class: 'min-w-[calc(3ch+3.125rem)]' },
    { size: 'md', digits: 4, class: 'min-w-[calc(4ch+3.125rem)]' },
    { size: 'lg', digits: 1, class: 'min-w-[calc(1ch+3.5rem)]' },
    { size: 'lg', digits: 2, class: 'min-w-[calc(2ch+3.5rem)]' },
    { size: 'lg', digits: 3, class: 'min-w-[calc(3ch+3.5rem)]' },
    { size: 'lg', digits: 4, class: 'min-w-[calc(4ch+3.5rem)]' },
  ],
  defaultVariants: { size: 'md' },
})

export const inputSelectDividerVariants = cva('w-px shrink-0 self-stretch bg-border')

export const inputSelectUnitSegmentVariants = cva(
  'inline-flex shrink-0 items-center justify-between gap-1.5 text-left [&>span]:line-clamp-1',
  {
    variants: {
      size: {
        sm: cn(segmentSizeVariants.sm, segmentReset, 'rounded-l-none rounded-r-md pl-2 pr-2'),
        md: cn(segmentSizeVariants.md, segmentReset, 'rounded-l-none rounded-r-md pl-2.5 pr-3'),
        lg: cn(segmentSizeVariants.lg, segmentReset, 'rounded-l-none rounded-r-md pl-3 pr-3.5'),
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
        class: 'min-w-[5.25rem]',
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
        class: 'min-w-48 max-w-64',
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

export type InputSelectGroupVariantProps = VariantProps<typeof inputSelectGroupVariants>
export type InputSelectSegmentVariantProps = VariantProps<typeof inputSelectValueSegmentVariants>
