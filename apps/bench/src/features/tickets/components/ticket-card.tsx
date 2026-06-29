import type { HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react'

import type { Ticket } from '@rpg/contracts/dev-bench'
import type { EpicCardMeta } from '@/features/epics'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  cn,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rpg/ui'
import { AlertTriangle, ChevronRight } from 'lucide-react'

import { BLOCKED_TICKET_ARIA_LABEL, BLOCKED_TICKET_TOOLTIP } from '../lib/ticket-card-labels'
import { EpicBadge } from './epic-badge'
import { PriorityBadge } from './priority-badge'
import { SizeBadge } from './size-badge'
import { TypeBadge } from './type-badge'
import {
  ticketCardAreaClasses,
  ticketCardContentClasses,
  ticketCardFooterClasses,
  ticketCardHeaderActionsClasses,
  ticketCardHeaderChevronClasses,
  ticketCardHeaderClasses,
  ticketCardHeaderTrailClasses,
  ticketCardInteractiveClasses,
  ticketCardKeyClasses,
  ticketCardRootClasses,
} from './ticket-card.variants'

function BlockedIndicator({ interactive }: { interactive: boolean }) {
  const icon = (
    <span className="inline-flex shrink-0 text-destructive" aria-hidden>
      <AlertTriangle className="size-4" />
    </span>
  )

  if (!interactive) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex shrink-0">{icon}</span>
        </TooltipTrigger>
        <TooltipContent side="top">{BLOCKED_TICKET_TOOLTIP}</TooltipContent>
      </Tooltip>
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
  epic?: EpicCardMeta | null
  onSelect?: (ticketId: string) => void
  className?: string
  /** When false, renders static card chrome (used on bench board drag surfaces). */
  interactive?: boolean
  /** When true, shows the size badge in the metadata row. */
  showSizeBadge?: boolean
  /** Overflow menu or other actions rendered in the card header (revealed on hover/focus). */
  headerActions?: ReactNode
  /** Optional ref for the body region (e.g. bench drag surface). */
  contentRef?: Ref<HTMLDivElement>
  /** Optional props for the body region (e.g. bench drag listeners). */
  contentProps?: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'ref'>
}

export function TicketCard({
  ticket,
  epic,
  onSelect,
  className,
  interactive = true,
  showSizeBadge = false,
  headerActions,
  contentRef,
  contentProps,
}: TicketCardProps) {
  const blocked = ticket.blockedByTicketIds.length > 0

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
        className={cn(
          ticketCardRootClasses,
          interactive && ticketCardInteractiveClasses,
          blocked && 'border-destructive/40',
          className,
        )}
      >
        <CardHeader className={ticketCardHeaderClasses}>
          <div className={ticketCardHeaderTrailClasses}>
            <EpicBadge epic={epic ?? null} stopActivation className="min-w-0 shrink" />
            <ChevronRight className={ticketCardHeaderChevronClasses} aria-hidden />
            <span className={ticketCardKeyClasses}>{ticket.key}</span>
          </div>
          {headerActions ? (
            <div className={ticketCardHeaderActionsClasses}>{headerActions}</div>
          ) : null}
        </CardHeader>
        <CardContent
          ref={contentRef}
          {...contentProps}
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
            ticketCardContentClasses,
            interactive &&
              'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            contentProps?.className,
          )}
        >
          <TicketTitle title={ticket.title} />
          <CardFooter className={ticketCardFooterClasses}>
            <TypeBadge type={ticket.type} />
            <PriorityBadge priority={ticket.priority} />
            {blocked ? <BlockedIndicator interactive={false} /> : null}
            {showSizeBadge ? <SizeBadge size={ticket.size} /> : null}
            {ticket.area ? <span className={ticketCardAreaClasses}>{ticket.area}</span> : null}
          </CardFooter>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
