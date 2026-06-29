import type { KeyboardEvent } from 'react'

import type { Ticket } from '@rpg/contracts/dev-bench'
import {
  Card,
  CardContent,
  cn,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rpg/ui'
import { AlertTriangle } from 'lucide-react'

import { BLOCKED_TICKET_ARIA_LABEL, BLOCKED_TICKET_TOOLTIP } from '../lib/ticket-card-labels'
import { PriorityBadge } from './priority-badge'
import { SizeBadge } from './size-badge'
import { TypeBadge } from './type-badge'

function BlockedIndicator({ interactive }: { interactive: boolean }) {
  if (!interactive) {
    return (
      <span className="inline-flex shrink-0 text-destructive" aria-hidden>
        <AlertTriangle className="size-4" />
      </span>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 rounded-sm text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={BLOCKED_TICKET_ARIA_LABEL}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AlertTriangle className="size-4" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{BLOCKED_TICKET_TOOLTIP}</TooltipContent>
    </Tooltip>
  )
}

function TicketTitle({ title }: { title: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block min-w-0">
          <Text className="line-clamp-2 font-medium">{title}</Text>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm">
        {title}
      </TooltipContent>
    </Tooltip>
  )
}

interface TicketCardProps {
  ticket: Ticket
  epicTitle?: string | null
  onSelect?: (ticketId: string) => void
  className?: string
  /** When false, renders static card chrome (used on bench board drag surfaces). */
  interactive?: boolean
}

export function TicketCard({
  ticket,
  epicTitle,
  onSelect,
  className,
  interactive = true,
}: TicketCardProps) {
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
    <TooltipProvider>
      <Card
        {...(interactive
          ? {
              role: 'button' as const,
              tabIndex: 0,
              onClick: handleActivate,
              onKeyDown: handleKeyDown,
              'aria-label': `${ticket.key}: ${ticket.title}`,
            }
          : {})}
        className={cn(
          interactive &&
            'cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          blocked && 'border-destructive/40',
          className,
        )}
      >
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <Text variant="small" className="font-mono text-muted-foreground">
                {ticket.key}
              </Text>
              <TicketTitle title={ticket.title} />
            </div>
            {blocked ? <BlockedIndicator interactive={interactive} /> : null}
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
    </TooltipProvider>
  )
}
