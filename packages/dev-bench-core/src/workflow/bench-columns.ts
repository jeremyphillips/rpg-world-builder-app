import type { Ticket, TicketPriority, TicketStatus } from '@rpg/contracts/dev-bench'

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

const PRIORITY_WEIGHT: Record<TicketPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

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
  const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
  if (priorityDiff !== 0) return priorityDiff

  const updatedDiff = b.updatedAt.localeCompare(a.updatedAt)
  if (updatedDiff !== 0) return updatedDiff

  return a.key.localeCompare(b.key)
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
