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
  epicTitle?: string | null
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
  epicTitle,
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
    <li className="relative">
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          benchDraggableTicketBaseClasses,
          isDragging && benchDraggableTicketDraggingClasses,
        )}
        aria-label={benchTicketAriaLabel(ticket)}
        onClick={() => onSelect?.(ticket.id)}
        {...listeners}
        {...attributes}
      >
        <TicketCard ticket={ticket} epicTitle={epicTitle} interactive={false} className="pr-10" />
      </div>
      <div className="absolute right-2 top-2 z-10">
        <TicketCardMoveMenu ticket={ticket} isPending={isMovePending} onMove={onMove} />
      </div>
    </li>
  )
}
