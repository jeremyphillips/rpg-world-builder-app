'use client'

import { Search } from 'lucide-react'
import * as React from 'react'

import { Input, cn } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'

export type GlobalSearchFieldProps = {
  id: string
  value: string
  onValueChange: (value: string) => void
  autoFocus?: boolean
  className?: string
}

export function GlobalSearchField({
  id,
  value,
  onValueChange,
  autoFocus = false,
  className,
}: GlobalSearchFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

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
        placeholder={GLOBAL_SEARCH_COPY.searchFieldPlaceholder}
        aria-label={GLOBAL_SEARCH_COPY.searchFieldLabel}
        className="pl-9"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  )
}
