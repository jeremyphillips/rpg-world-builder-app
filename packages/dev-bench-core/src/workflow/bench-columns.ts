import type { Ticket, TicketStatus } from '@rpg/contracts/dev-bench'

import { compareTicketsByPriorityUpdatedKey } from '../scoring/ticket-compare'

export const BENCH_COLUMNS = ['up_next', 'in_progress', 'blocked', 'done'] as const

/** All statuses offered in the card move menu (bench columns + off-bench). */
export const MOVE_STATUS_OPTIONS: TicketStatus[] = [
  'up_next',
  'in_progress',
  'blocked',
  'done',
  'backlog',
  'wont_do',
]

export type BenchColumn = (typeof BENCH_COLUMNS)[number]

const BENCH_VISIBLE_STATUSES = new Set<TicketStatus>(BENCH_COLUMNS)

function isBenchColumn(status: TicketStatus): status is BenchColumn {
  return BENCH_VISIBLE_STATUSES.has(status)
}

export function isBenchVisibleStatus(status: TicketStatus): boolean {
  return isBenchColumn(status)
}

export function benchColumnForStatus(status: TicketStatus): BenchColumn | null {
  return isBenchColumn(status) ? status : null
}

export function statusesForBenchColumn(column: BenchColumn): TicketStatus[] {
  return [column]
}

/** Menu targets excluding the ticket's current status. */
export function getMoveStatusOptions(currentStatus: TicketStatus): TicketStatus[] {
  return MOVE_STATUS_OPTIONS.filter((status) => status !== currentStatus)
}

/** Soft confirm when marking a blocked ticket done. */
export function shouldConfirmStatusMove(
  ticket: Pick<Ticket, 'blockedByTicketIds'>,
  nextStatus: TicketStatus,
): boolean {
  return nextStatus === 'done' && ticket.blockedByTicketIds.length > 0
}

function compareBenchColumnTickets(a: Ticket, b: Ticket): number {
  return compareTicketsByPriorityUpdatedKey(a, b)
}

/** Sort tickets within a bench column. */
export function sortBenchColumnTickets(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort(compareBenchColumnTickets)
}

/** Bucket all tickets into bench columns; ignores backlog/wont_do. */
export function bucketTicketsByBenchColumn(tickets: Ticket[]): Record<BenchColumn, Ticket[]> {
  const buckets = Object.fromEntries(
    BENCH_COLUMNS.map((column) => [column, [] as Ticket[]]),
  ) as Record<BenchColumn, Ticket[]>

  for (const ticket of tickets) {
    const column = benchColumnForStatus(ticket.status)
    if (column) buckets[column].push(ticket)
  }

  for (const column of BENCH_COLUMNS) {
    buckets[column] = sortBenchColumnTickets(buckets[column])
  }

  return buckets
}
