import * as React from 'react'

import { SearchBar, cn, type InputProps } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'

export type GlobalSearchFieldProps = {
  id: string
  value: string
  onValueChange: (value: string) => void
  autoFocus?: boolean
  className?: string
  size?: InputProps['size']
  'aria-controls'?: string
  'aria-expanded'?: boolean
  onRequestClose?: () => void
  onSubmit?: () => void
}

export const GlobalSearchField = React.forwardRef<HTMLInputElement, GlobalSearchFieldProps>(
  function GlobalSearchField(
    {
      id,
      value,
      onValueChange,
      autoFocus = false,
      className,
      size = 'md',
      'aria-controls': ariaControls,
      'aria-expanded': ariaExpanded,
      onRequestClose,
      onSubmit,
    },
    ref,
  ) {
    return (
      <SearchBar
        ref={ref}
        id={id}
        value={value}
        onValueChange={onValueChange}
        placeholder={GLOBAL_SEARCH_COPY.searchFieldPlaceholder}
        ariaLabel={GLOBAL_SEARCH_COPY.searchFieldLabel}
        size={size}
        autoFocus={autoFocus}
        className={cn(className)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onSubmit?.()
            return
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            onRequestClose?.()
          }
        }}
      />
    )
  },
)
