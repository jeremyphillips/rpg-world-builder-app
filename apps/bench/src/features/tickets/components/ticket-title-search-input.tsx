import { Input, cn } from '@rpg/ui'

import {
  ticketTitleSearchInputClasses,
  ticketTitleSearchInputCompactClasses,
} from './ticket-title-search-input.variants'

interface TicketTitleSearchInputProps {
  id?: string
  /** Visible label; omit in compact toolbar layouts and rely on `aria-label`. */
  label?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Toolbar-friendly width preset for page headers. */
  compact?: boolean
  'aria-label'?: string
}

/** Normalized ticket title search field shared by backlog filters and bench header. */
export function TicketTitleSearchInput({
  id = 'ticket-title-search',
  label,
  value,
  onValueChange,
  placeholder = 'Search titles…',
  className,
  compact = false,
  'aria-label': ariaLabel = 'Search tickets',
}: TicketTitleSearchInputProps) {
  const input = (
    <Input
      id={id}
      type="search"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={placeholder}
      aria-label={label ? undefined : ariaLabel}
      className={cn(
        compact ? ticketTitleSearchInputCompactClasses : ticketTitleSearchInputClasses,
        className,
      )}
    />
  )

  if (!label) {
    return input
  }

  return (
    <div className="min-w-[12rem] flex-1 space-y-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      {input}
    </div>
  )
}
