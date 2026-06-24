import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldControlVariants } from './field-control.variants'

export const inputSelectGroupVariants = cva(
  'flex w-full rounded-md border border-input bg-transparent shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background dark:bg-input/30',
  {
    variants: {
      invalid: {
        true: 'border-destructive focus-within:ring-destructive [&_[data-input-select-segment]]:bg-destructive/5',
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

const segmentReset =
  'border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 aria-invalid:border-0 aria-invalid:shadow-none'

export const inputSelectValueSegmentVariants = cva(
  cn(segmentReset, 'min-w-0 flex-1 rounded-l-md rounded-r-none'),
  {
    variants: {
      size: {
        sm: fieldControlVariants({ size: 'sm' }),
        md: fieldControlVariants({ size: 'md' }),
        lg: fieldControlVariants({ size: 'lg' }),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const inputSelectValueWrapperVariants = cva('min-w-0 flex-1')

export const inputSelectDividerVariants = cva('w-px shrink-0 self-stretch bg-border')

export const inputSelectUnitSegmentVariants = cva(
  cn(
    segmentReset,
    'inline-flex shrink-0 items-center justify-between gap-1.5 rounded-l-none rounded-r-md text-left [&>span]:line-clamp-1',
  ),
  {
    variants: {
      size: {
        sm: cn(fieldControlVariants({ size: 'sm' }), 'pl-2 pr-1.5'),
        md: cn(fieldControlVariants({ size: 'md' }), 'pl-2.5 pr-2'),
        lg: cn(fieldControlVariants({ size: 'lg' }), 'pl-3 pr-2.5'),
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
        class: 'min-w-36 max-w-48',
      },
      {
        searchable: true,
        size: 'md',
        class: 'min-w-40 max-w-56',
      },
      {
        searchable: true,
        size: 'lg',
        class: 'min-w-44 max-w-64',
      },
    ],
    defaultVariants: {
      size: 'md',
      searchable: false,
    },
  },
)

export const inputSelectSearchablePanelVariants = cva('min-w-48')

export type InputSelectGroupVariantProps = VariantProps<typeof inputSelectGroupVariants>
export type InputSelectSegmentVariantProps = VariantProps<typeof inputSelectValueSegmentVariants>
