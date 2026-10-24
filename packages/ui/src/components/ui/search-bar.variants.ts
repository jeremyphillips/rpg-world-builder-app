/**
 * SearchBar chrome — field (bordered Input) and embedded (popover toolbar) appearances.
 * Clear inset targets reuse {@link fieldClearAffordanceInsetVariants} (caret column width).
 */
import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type { FieldSizeToken } from './field-sizing.variants'
import {
  UI_SEARCH_BAR_EMBEDDED_LEADING_ICON_CLASS,
  resolveSearchBarEmbeddedInputClass,
  resolveSearchBarFieldInputClass,
  resolveSearchBarLeadingIconClass,
} from './field-control.styles'

/** Chromeless inner search input — host row (combobox panel, list toolbar) owns border/height. */
export const searchBarEmbeddedChromeInputVariants =
  'min-w-0 flex-1 border-0 bg-transparent shadow-none rounded-none dark:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'

export const searchBarLeadingIconVariants = cva(
  cn('ui-search-bar__leading-icon ui-search-bar__leading-icon--field'),
  {
    variants: {
      appearance: {
        field: '',
        embedded: '',
      },
      size: {
        xs: 'ui-search-bar__leading-icon--xs',
        sm: 'ui-search-bar__leading-icon--sm',
        md: 'ui-search-bar__leading-icon--md',
        lg: 'ui-search-bar__leading-icon--lg',
      },
      disabled: {
        true: 'ui-search-bar__leading-icon--disabled',
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

export const searchBarEmbeddedLeadingIconVariants = cva(UI_SEARCH_BAR_EMBEDDED_LEADING_ICON_CLASS, {
  variants: {
    disabled: {
      true: 'ui-search-bar__embedded-icon--disabled',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

export const searchBarFieldInputVariants = cva('', {
  variants: {
    size: {
      xs: resolveSearchBarFieldInputClass('xs'),
      sm: resolveSearchBarFieldInputClass('sm'),
      md: resolveSearchBarFieldInputClass('md'),
      lg: resolveSearchBarFieldInputClass('lg'),
    },
    clearable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { size: 'xs', clearable: true, class: 'ui-search-bar__field-input--clearable' },
    { size: 'sm', clearable: true, class: 'ui-search-bar__field-input--clearable' },
    { size: 'md', clearable: true, class: 'ui-search-bar__field-input--clearable' },
    { size: 'lg', clearable: true, class: 'ui-search-bar__field-input--clearable' },
  ],
  defaultVariants: {
    size: 'md',
    clearable: false,
  },
})

export const searchBarEmbeddedInputVariants = cva(searchBarEmbeddedChromeInputVariants, {
  variants: {
    size: {
      xs: resolveSearchBarEmbeddedInputClass('xs'),
      sm: resolveSearchBarEmbeddedInputClass('sm'),
      md: resolveSearchBarEmbeddedInputClass('md'),
      lg: resolveSearchBarEmbeddedInputClass('lg'),
    },
    clearable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { size: 'xs', clearable: true, class: 'ui-search-bar__embedded-input--clearable' },
    { size: 'sm', clearable: true, class: 'ui-search-bar__embedded-input--clearable' },
    { size: 'md', clearable: true, class: 'ui-search-bar__embedded-input--clearable' },
    { size: 'lg', clearable: true, class: 'ui-search-bar__embedded-input--clearable' },
  ],
  defaultVariants: {
    size: 'md',
    clearable: false,
  },
})

export function searchBarLeadingIconClassForSize(size: FieldSizeToken): string {
  return resolveSearchBarLeadingIconClass(size)
}
