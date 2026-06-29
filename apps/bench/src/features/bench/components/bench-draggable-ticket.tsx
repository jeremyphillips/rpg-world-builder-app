import type { EpicCardMeta } from '@/features/epics'
import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'
import type { BenchColumn } from '@rpg/dev-bench-core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@rpg/ui'

import { TicketCard } from '@/features/tickets'

import { benchTicketDndId } from '../lib/bench-dnd-ids'
import {
  benchDraggableTicketBaseClasses,
  benchDraggableTicketDraggingClasses,
} from './bench-board.variants'
import { TicketCardMoveMenu } from './ticket-card-move-menu'

interface BenchDraggableTicketProps {
  ticket: Ticket
  column: BenchColumn
  epic?: EpicCardMeta | null
  onSelect?: (ticketId: string) => void
  onMove: (nextStatus: TicketStatus) => void
  isMovePending?: boolean
}

function benchTicketAriaLabel(ticket: Ticket): string {
  const blocked = ticket.blockedByTicketIds.length > 0
  if (blocked) {
    return `${ticket.key}: ${ticket.title}. Blocked by other tickets.`
  }
  return `${ticket.key}: ${ticket.title}`
}

export function BenchDraggableTicket({
  ticket,
  column,
  epic,
  onSelect,
  onMove,
  isMovePending = false,
}: BenchDraggableTicketProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: benchTicketDndId(ticket.id),
    data: { type: 'ticket', ticketId: ticket.id, column },
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <li>
      <TicketCard
        ticket={ticket}
        epic={epic}
        interactive={false}
        headerActions={
          <TicketCardMoveMenu ticket={ticket} isPending={isMovePending} onMove={onMove} />
        }
        contentRef={setNodeRef}
        contentProps={{
          style,
          className: cn(
            benchDraggableTicketBaseClasses,
            isDragging && benchDraggableTicketDraggingClasses,
          ),
          'aria-label': benchTicketAriaLabel(ticket),
          onClick: () => onSelect?.(ticket.id),
          ...listeners,
          ...attributes,
        }}
      />
    </li>
  )
}
