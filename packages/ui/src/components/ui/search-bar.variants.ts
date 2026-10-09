/**
 * SearchBar chrome — field (bordered Input) and embedded (popover toolbar) appearances.
 * Clear inset targets reuse {@link fieldClearAffordanceInsetVariants} (caret column width).
 */
import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { comboboxSearchInputVariants } from './combobox-field.variants'
import { fieldClearAffordanceInsetVariants } from './field-clear-affordance.variants'
export const searchBarRootVariants = cva('relative w-full min-w-0')

/** Embedded hosts supply outer row padding; SearchBar is flex + min-w-0 flex-1 only. */
export const searchBarEmbeddedRootVariants = cva('flex min-w-0 flex-1 items-center gap-2')

export const searchBarEmbeddedInputWrapVariants = cva('relative min-w-0 flex-1')

export const searchBarLeadingIconVariants = cva(
  'pointer-events-none shrink-0 text-input-placeholder',
  {
    variants: {
      appearance: {
        field: 'absolute top-1/2 -translate-y-1/2',
        embedded: '',
      },
      size: {
        sm: 'left-2.5 size-icon-glyph-sm',
        md: 'left-3 size-icon-glyph-md',
        lg: 'left-3 size-icon-glyph-md',
      },
      disabled: {
        true: 'text-input-disabled',
        false: '',
      },
    },
    defaultVariants: {
      appearance: 'field',
      size: 'md',
      disabled: false,
    },
  },
)

export const searchBarEmbeddedLeadingIconVariants = cva(
  'pointer-events-none size-icon-glyph-md shrink-0 text-muted-foreground',
  {
    variants: {
      disabled: {
        true: 'text-input-disabled',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

const webkitSearchCancelHide = '[&::-webkit-search-cancel-button]:appearance-none'

export const searchBarFieldInputVariants = cva('', {
  variants: {
    size: {
      sm: 'pl-8',
      md: 'pl-9',
      lg: 'pl-10',
    },
    clearable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { size: 'sm', clearable: true, class: cn('pr-8', webkitSearchCancelHide) },
    { size: 'md', clearable: true, class: cn('pr-8', webkitSearchCancelHide) },
    { size: 'lg', clearable: true, class: cn('pr-9', webkitSearchCancelHide) },
  ],
  defaultVariants: {
    size: 'md',
    clearable: false,
  },
})

export const searchBarEmbeddedInputVariants = cva(comboboxSearchInputVariants(), {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
    clearable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { size: 'sm', clearable: true, class: cn('pr-8', webkitSearchCancelHide) },
    { size: 'md', clearable: true, class: cn('pr-8', webkitSearchCancelHide) },
    { size: 'lg', clearable: true, class: cn('pr-9', webkitSearchCancelHide) },
  ],
  defaultVariants: {
    size: 'md',
    clearable: false,
  },
})

export { fieldClearAffordanceInsetVariants as searchBarClearInsetVariants }
