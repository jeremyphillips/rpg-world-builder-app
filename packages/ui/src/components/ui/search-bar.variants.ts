/**
 * SearchBar chrome — field (bordered Input) and embedded (popover toolbar) appearances.
 * Clear inset targets reuse {@link fieldClearAffordanceInsetVariants} (caret column width).
 */
import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type { FieldSizeToken } from './field-sizing.variants'
import {
  UI_SEARCH_BAR_CLASS,
  UI_SEARCH_BAR_EMBEDDED_HOST_CLASS,
  UI_SEARCH_BAR_EMBEDDED_INPUT_WRAP_CLASS,
  UI_SEARCH_BAR_EMBEDDED_LEADING_ICON_CLASS,
  resolveSearchBarEmbeddedInputClass,
  resolveSearchBarFieldInputClass,
  resolveSearchBarLeadingIconClass,
} from './field-control.styles'

export const searchBarRootVariants = cva(UI_SEARCH_BAR_CLASS)

/** Chromeless inner search input — host row (combobox panel, list toolbar) owns border/height. */
export const searchBarEmbeddedChromeInputVariants = cva(
  'min-w-0 flex-1 border-0 bg-transparent shadow-none rounded-none dark:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
)

/** Embedded hosts supply outer row padding; SearchBar is flex + min-w-0 flex-1 only. */
export const searchBarEmbeddedRootVariants = cva(UI_SEARCH_BAR_EMBEDDED_HOST_CLASS)

export const searchBarEmbeddedInputWrapVariants = cva(UI_SEARCH_BAR_EMBEDDED_INPUT_WRAP_CLASS)

export const searchBarLeadingIconVariants = cva(
  cn('ui-search-bar__leading-icon ui-search-bar__leading-icon--field'),
  {
    variants: {
      appearance: {
        field: '',
        embedded: '',
      },
      size: {
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
    { size: 'sm', clearable: true, class: 'ui-search-bar__field-input--clearable' },
    { size: 'md', clearable: true, class: 'ui-search-bar__field-input--clearable' },
    { size: 'lg', clearable: true, class: 'ui-search-bar__field-input--clearable' },
  ],
  defaultVariants: {
    size: 'md',
    clearable: false,
  },
})

export const searchBarEmbeddedInputVariants = cva(searchBarEmbeddedChromeInputVariants(), {
  variants: {
    size: {
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
