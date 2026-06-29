import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'
import type { BenchColumn } from '@rpg/dev-bench-core'

import { BenchDraggableTicket } from './bench-draggable-ticket'

interface BenchTicketCardProps {
  ticket: Ticket
  column: BenchColumn
  epicTitle?: string | null
  onSelect?: (ticketId: string) => void
  onMove: (nextStatus: TicketStatus) => void
  isMovePending?: boolean
}

/** Bench card with drag surface + overflow menu. Requires a DndContext ancestor. */
export function BenchTicketCard({
  ticket,
  column,
  epicTitle,
  onSelect,
  onMove,
  isMovePending = false,
}: BenchTicketCardProps) {
  return (
    <BenchDraggableTicket
      ticket={ticket}
      column={column}
      epicTitle={epicTitle}
      onSelect={onSelect}
      onMove={onMove}
      isMovePending={isMovePending}
    />
  )
}
