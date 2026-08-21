import * as React from 'react'
import { Search } from 'lucide-react'

import { Button, cn } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'

export type GlobalSearchTriggerProps = {
  disabled?: boolean
  onOpen: () => void
  className?: string
  'aria-controls'?: string
  'aria-expanded'?: boolean
}

export const GlobalSearchTrigger = React.forwardRef<HTMLButtonElement, GlobalSearchTriggerProps>(
  function GlobalSearchTrigger(
    {
      disabled = false,
      onOpen,
      className,
      'aria-controls': ariaControls,
      'aria-expanded': ariaExpanded,
    },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={GLOBAL_SEARCH_COPY.triggerLabel}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        disabled={disabled}
        onClick={onOpen}
        className={cn(
          'relative shrink-0 hover:bg-accent hover:text-accent-foreground md:w-auto md:min-w-[7.5rem] md:justify-start md:gap-2 md:px-3 md:[&_svg]:size-4',
          className,
        )}
      >
        <Search aria-hidden className="size-5" />
        <span className="hidden text-sm md:inline">{GLOBAL_SEARCH_COPY.triggerLabel}</span>
        <span className="hidden text-xs text-muted-foreground md:inline">
          {GLOBAL_SEARCH_COPY.triggerShortcutHint}
        </span>
      </Button>
    )
  },
)
