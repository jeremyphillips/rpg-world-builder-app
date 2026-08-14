'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Input, type InputProps } from './input.client'
import type { FieldSize } from './field.client'
import {
  searchBarClearButtonVariants,
  searchBarInputVariants,
  searchBarLeadingIconVariants,
  searchBarRootVariants,
} from './search-bar.variants'

export type SearchBarProps = Omit<
  InputProps,
  'id' | 'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  id: string
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  /** Accessible name when no visible label is shown. Defaults to `placeholder`. */
  ariaLabel?: string
  clearLabel?: string
  size?: FieldSize
}

/**
 * Placeholder-only search affordance with a leading magnifying-glass icon and an
 * optional trailing clear control when the field has a value.
 */
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      id,
      value,
      onValueChange,
      placeholder,
      ariaLabel,
      clearLabel = 'Clear search',
      size = 'md',
      disabled,
      className,
      ...inputProps
    },
    ref,
  ) => {
    const showClear = value.length > 0 && !disabled

    return (
      <div className={searchBarRootVariants()}>
        <Search
          className={searchBarLeadingIconVariants({ disabled: Boolean(disabled) })}
          aria-hidden
        />
        <Input
          ref={ref}
          id={id}
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          size={size}
          disabled={disabled}
          className={cn(searchBarInputVariants({ clearable: showClear }), className)}
          {...inputProps}
        />
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            density="compact"
            className={searchBarClearButtonVariants()}
            aria-label={clearLabel}
            onClick={() => onValueChange('')}
          >
            <X aria-hidden />
          </Button>
        ) : null}
      </div>
    )
  },
)
SearchBar.displayName = 'SearchBar'
