import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldControlVariants } from './field-control.variants'

export const inputSelectGroupVariants = cva(
  'flex w-full overflow-hidden rounded-md border border-input bg-transparent shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background dark:bg-input/30',
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
 * Bare reset applied to every segment: strips the individual field control
 * border, shadow, focus-ring, and outline. Placing this AFTER fieldControlVariants
 * in each CVA size variant ensures tailwind-merge's last-wins rule suppresses
 * the ring/outline on individual segments — focus is handled by the group shell's
 * focus-within ring instead.
 */
const segmentReset =
  'border-0 shadow-none bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 aria-invalid:border-0 aria-invalid:shadow-none rounded-none'

/**
 * Bare reset classnames exported for use as NumberInput.className when the
 * number input is embedded in a group. Does NOT include fieldControlVariants
 * (and therefore does not override numberInputFieldVariants' pr-7 stepper gap).
 */
export const inputSelectSegmentResetClassNames = segmentReset

export const inputSelectValueSegmentVariants = cva('min-w-0 flex-1', {
  variants: {
    size: {
      sm: cn(fieldControlVariants({ size: 'sm' }), segmentReset, 'rounded-l-md rounded-r-none'),
      md: cn(fieldControlVariants({ size: 'md' }), segmentReset, 'rounded-l-md rounded-r-none'),
      lg: cn(fieldControlVariants({ size: 'lg' }), segmentReset, 'rounded-l-md rounded-r-none'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Wrapper for the NumberInput in the grouped context. Handles left rounding and
 * overflow clipping (so the absolutely-positioned stepper column doesn't escape
 * the group shell) and enforces a minimum width floor.
 */
export const inputSelectValueWrapperVariants = cva('min-w-16 flex-1 overflow-hidden rounded-l-md')

export const inputSelectDividerVariants = cva('w-px shrink-0 self-stretch bg-border')

export const inputSelectUnitSegmentVariants = cva(
  'inline-flex shrink-0 items-center justify-between gap-1.5 text-left [&>span]:line-clamp-1',
  {
    variants: {
      size: {
        sm: cn(
          fieldControlVariants({ size: 'sm' }),
          segmentReset,
          'rounded-l-none rounded-r-md pl-2 pr-1.5',
        ),
        md: cn(
          fieldControlVariants({ size: 'md' }),
          segmentReset,
          'rounded-l-none rounded-r-md pl-2.5 pr-2',
        ),
        lg: cn(
          fieldControlVariants({ size: 'lg' }),
          segmentReset,
          'rounded-l-none rounded-r-md pl-3 pr-2.5',
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
