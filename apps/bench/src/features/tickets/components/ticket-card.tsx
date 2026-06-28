import type { KeyboardEvent } from 'react'

import type { Ticket } from '@rpg/contracts/dev-bench'
import { Card, CardContent, cn, Text } from '@rpg/ui'
import { AlertTriangle } from 'lucide-react'

import { PriorityBadge } from './priority-badge'
import { SizeBadge } from './size-badge'
import { TypeBadge } from './type-badge'

interface TicketCardProps {
  ticket: Ticket
  epicTitle?: string | null
  onSelect?: (ticketId: string) => void
  className?: string
}

export function TicketCard({ ticket, epicTitle, onSelect, className }: TicketCardProps) {
  const blocked = ticket.blockedByTicketIds.length > 0
  const epicLabel = epicTitle ?? (ticket.epicId ? 'Unknown epic' : 'No epic')

  function handleActivate() {
    onSelect?.(ticket.id)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleActivate()
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        blocked && 'border-destructive/40',
        className,
      )}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      aria-label={`${ticket.key}: ${ticket.title}`}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Text variant="small" className="font-mono text-muted-foreground">
              {ticket.key}
            </Text>
            <Text className="truncate font-medium">{ticket.title}</Text>
          </div>
          {blocked ? (
            <AlertTriangle
              className="size-4 shrink-0 text-destructive"
              aria-label="Blocked by other tickets"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={ticket.type} />
          <PriorityBadge priority={ticket.priority} />
          <SizeBadge size={ticket.size} />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{epicLabel}</span>
          {ticket.area ? <span>{ticket.area}</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}
