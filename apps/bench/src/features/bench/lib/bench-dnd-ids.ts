import { BENCH_COLUMNS, type BenchColumn } from '@rpg/dev-bench-core'

export const BENCH_COLUMN_DND_PREFIX = 'bench-column:'
export const BENCH_TICKET_DND_PREFIX = 'bench-ticket:'

export function benchColumnDndId(column: BenchColumn): string {
  return `${BENCH_COLUMN_DND_PREFIX}${column}`
}

export function benchTicketDndId(ticketId: string): string {
  return `${BENCH_TICKET_DND_PREFIX}${ticketId}`
}

export function parseBenchColumnDndId(id: string): BenchColumn | null {
  if (!id.startsWith(BENCH_COLUMN_DND_PREFIX)) return null
  const column = id.slice(BENCH_COLUMN_DND_PREFIX.length)
  return BENCH_COLUMNS.includes(column as BenchColumn) ? (column as BenchColumn) : null
}

export function parseBenchTicketDndId(id: string): string | null {
  if (!id.startsWith(BENCH_TICKET_DND_PREFIX)) return null
  const ticketId = id.slice(BENCH_TICKET_DND_PREFIX.length)
  return ticketId.length > 0 ? ticketId : null
}
