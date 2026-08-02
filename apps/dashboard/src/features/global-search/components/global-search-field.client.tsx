'use client'

import { Search } from 'lucide-react'
import * as React from 'react'

import { Input, cn, type InputProps } from '@rpg/ui'

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
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    React.useEffect(() => {
      if (!autoFocus) return
      inputRef.current?.focus()
    }, [autoFocus])

    return (
      <div className={cn('relative flex items-center', className)}>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          id={id}
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
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
          placeholder={GLOBAL_SEARCH_COPY.searchFieldPlaceholder}
          aria-label={GLOBAL_SEARCH_COPY.searchFieldLabel}
          aria-controls={ariaControls}
          aria-expanded={ariaExpanded}
          className="pl-9"
          size={size}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    )
  },
)
