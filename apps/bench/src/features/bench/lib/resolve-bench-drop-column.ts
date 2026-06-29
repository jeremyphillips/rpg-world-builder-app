import type { Over } from '@dnd-kit/core'
import type { Ticket } from '@rpg/contracts/dev-bench'
import { benchColumnForStatus, type BenchColumn } from '@rpg/dev-bench-core'

import { parseBenchColumnDndId, parseBenchTicketDndId } from './bench-dnd-ids'

/** Maps a drag-over target to the bench column being dropped onto. */
export function resolveBenchDropColumn(
  over: Over,
  ticketsById: Map<string, Ticket>,
): BenchColumn | null {
  const columnFromOver = parseBenchColumnDndId(String(over.id))
  if (columnFromOver) return columnFromOver

  const ticketId = parseBenchTicketDndId(String(over.id))
  if (!ticketId) return null

  const ticket = ticketsById.get(ticketId)
  if (!ticket) return null

  return benchColumnForStatus(ticket.status)
}
