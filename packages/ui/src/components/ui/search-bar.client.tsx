'use client'

import * as React from 'react'
import { Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { FieldClearAffordanceButton } from './field-clear-affordance.client'
import { Input, type InputProps } from './input.client'
import type { FieldSize } from './field.client'
import {
  searchBarEmbeddedInputVariants,
  searchBarEmbeddedInputWrapVariants,
  searchBarEmbeddedLeadingIconVariants,
  searchBarEmbeddedRootVariants,
  searchBarFieldInputVariants,
  searchBarLeadingIconVariants,
  searchBarRootVariants,
} from './search-bar.variants'
import { useSearchBarControlSize } from './use-search-bar-control-size.client'

export type SearchBarAppearance = 'field' | 'embedded'

export type SearchBarProps = Omit<
  InputProps,
  'id' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'size' | 'aria-label'
> & {
  id: string
  value: string
  onValueChange: (value: string) => void
  /** Accessible name — not derived from placeholder. */
  ariaLabel: string
  /** Presentation-only hint. */
  placeholder?: string
  clearLabel?: string
  size?: FieldSize
  appearance?: SearchBarAppearance
  /** Optional second ref (combobox panel search). */
  inputRef?: React.RefObject<HTMLInputElement | null>
  autoFocus?: boolean
}

function assignInputRef(
  node: HTMLInputElement | null,
  ref: React.ForwardedRef<HTMLInputElement>,
  inputRef?: React.RefObject<HTMLInputElement | null>,
) {
  if (inputRef) {
    inputRef.current = node
  }
  if (typeof ref === 'function') {
    ref(node)
  } else if (ref) {
    ref.current = node
  }
}

/**
 * Search affordance with leading icon and trailing clear when the field has a value.
 * `appearance="field"` — bordered Input; `embedded` — chromeless input for popover toolbars.
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
      size: sizeProp,
      appearance = 'field',
      disabled,
      className,
      inputRef,
      autoFocus = false,
      onKeyDown,
      ...inputProps
    },
    ref,
  ) => {
    const resolvedSize = useSearchBarControlSize(sizeProp)
    const localInputRef = React.useRef<HTMLInputElement>(null)
    const showClear = value.length > 0 && !disabled

    React.useEffect(() => {
      if (!autoFocus) return
      localInputRef.current?.focus()
    }, [autoFocus])

    const handleClear = React.useCallback(() => {
      onValueChange('')
      const node = localInputRef.current
      if (node) {
        queueMicrotask(() => node.focus())
      }
    }, [onValueChange])

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        localInputRef.current = node
        assignInputRef(node, ref, inputRef)
      },
      [inputRef, ref],
    )

    const clearControl = showClear ? (
      <FieldClearAffordanceButton
        variant="inset"
        size={resolvedSize}
        accessibleName={clearLabel}
        onClear={handleClear}
      />
    ) : null

    if (appearance === 'embedded') {
      return (
        <div className={cn(searchBarEmbeddedRootVariants(), className)}>
          <Search
            className={searchBarEmbeddedLeadingIconVariants({ disabled: Boolean(disabled) })}
            aria-hidden
          />
          <div className={searchBarEmbeddedInputWrapVariants()}>
            <input
              ref={setRefs}
              id={id}
              type="search"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              aria-label={ariaLabel}
              disabled={disabled}
              autoComplete="off"
              className={searchBarEmbeddedInputVariants({
                size: resolvedSize,
                clearable: showClear,
              })}
              {...inputProps}
            />
            {clearControl}
          </div>
        </div>
      )
    }

    return (
      <div className={searchBarRootVariants()}>
        <Search
          className={searchBarLeadingIconVariants({
            appearance: 'field',
            size: resolvedSize,
            disabled: Boolean(disabled),
          })}
          aria-hidden
        />
        <Input
          ref={setRefs}
          id={id}
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          size={resolvedSize}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            searchBarFieldInputVariants({ size: resolvedSize, clearable: showClear }),
            className,
          )}
          {...inputProps}
        />
        {clearControl}
      </div>
    )
  },
)
SearchBar.displayName = 'SearchBar'
