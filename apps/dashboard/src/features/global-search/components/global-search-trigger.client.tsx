'use client'

import { Search } from 'lucide-react'

import { Button, cn } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'

export type GlobalSearchTriggerProps = {
  disabled?: boolean
  onOpen: () => void
  className?: string
}

export function GlobalSearchTrigger({
  disabled = false,
  onOpen,
  className,
}: GlobalSearchTriggerProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={GLOBAL_SEARCH_COPY.triggerLabel}
      disabled={disabled}
      onClick={onOpen}
      className={cn(
        'relative shrink-0 hover:bg-accent hover:text-accent-foreground sm:w-auto sm:min-w-[7.5rem] sm:justify-start sm:gap-2 sm:px-3 sm:[&_svg]:size-4',
        className,
      )}
    >
      <Search aria-hidden className="size-5" />
      <span className="hidden text-sm sm:inline">{GLOBAL_SEARCH_COPY.triggerLabel}</span>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {GLOBAL_SEARCH_COPY.triggerShortcutHint}
      </span>
    </Button>
  )
}
