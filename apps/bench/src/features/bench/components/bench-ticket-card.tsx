import type { EpicCardMeta } from '@/features/epics'
import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'
import type { BenchColumn } from '@rpg/dev-bench-core'

import { BenchDraggableTicket } from './bench-draggable-ticket'

interface BenchTicketCardProps {
  ticket: Ticket
  column: BenchColumn
  epic?: EpicCardMeta | null
  onSelect?: (ticketId: string) => void
  onMove: (nextStatus: TicketStatus) => void
  isMovePending?: boolean
}

/** Bench card with drag surface + overflow menu. Requires a DndContext ancestor. */
export function BenchTicketCard({
  ticket,
  column,
  epic,
  onSelect,
  onMove,
  isMovePending = false,
}: BenchTicketCardProps) {
  return (
    <BenchDraggableTicket
      ticket={ticket}
      column={column}
      epic={epic}
      onSelect={onSelect}
      onMove={onMove}
      isMovePending={isMovePending}
    />
  )
}
