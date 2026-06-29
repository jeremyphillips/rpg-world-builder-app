import type { BenchColumn } from '@rpg/dev-bench-core'
import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'
import { getTicketStatusLabel } from '@rpg/contracts/dev-bench'
import { useDroppable } from '@dnd-kit/core'
import { Badge, cn, Text } from '@rpg/ui'

import { BENCH_COLUMN_EMPTY_COPY } from '../lib/column-empty-copy'
import { benchColumnDndId } from '../lib/bench-dnd-ids'
import { benchColumnBaseClasses, benchColumnDropTargetClasses } from './bench-board.variants'
import { BenchDraggableTicket } from './bench-draggable-ticket'

interface BenchColumnProps {
  column: BenchColumn
  tickets: Ticket[]
  epicTitleById: Map<string, string>
  isDragActive?: boolean
  onSelectTicket?: (ticketId: string) => void
  onMoveTicket: (ticket: Ticket, nextStatus: TicketStatus) => void
  isMovePending?: boolean
}

export function BenchColumn({
  column,
  tickets,
  epicTitleById,
  isDragActive = false,
  onSelectTicket,
  onMoveTicket,
  isMovePending = false,
}: BenchColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: benchColumnDndId(column),
    data: { type: 'column', column },
  })

  const showDropTarget = isDragActive && isOver

  return (
    <section
      ref={setNodeRef}
      aria-label={getTicketStatusLabel(column)}
      className={cn(benchColumnBaseClasses, showDropTarget && benchColumnDropTargetClasses)}
    >
      <header className="flex items-center gap-2 px-1">
        <Text className="font-medium">{getTicketStatusLabel(column)}</Text>
        <Badge variant="secondary">{tickets.length}</Badge>
      </header>
      {tickets.length === 0 ? (
        <Text variant="muted" className="px-1">
          {BENCH_COLUMN_EMPTY_COPY[column]}
        </Text>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <BenchDraggableTicket
              key={ticket.id}
              ticket={ticket}
              column={column}
              epicTitle={ticket.epicId ? epicTitleById.get(ticket.epicId) : null}
              onSelect={onSelectTicket}
              onMove={(nextStatus) => onMoveTicket(ticket, nextStatus)}
              isMovePending={isMovePending}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
