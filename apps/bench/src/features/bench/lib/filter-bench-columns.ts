import { BENCH_COLUMNS, type BenchColumn } from '@rpg/dev-bench-core'
import type { Ticket } from '@rpg/contracts/dev-bench'

import { ticketTitleMatchesSearch } from '@/features/tickets'

export function filterBenchColumnsBySearch(
  columns: Record<BenchColumn, Ticket[]>,
  search: string | undefined,
): Record<BenchColumn, Ticket[]> {
  const trimmed = search?.trim()
  if (!trimmed) return columns

  return Object.fromEntries(
    BENCH_COLUMNS.map((column) => [
      column,
      columns[column].filter((ticket) => ticketTitleMatchesSearch(ticket.title, trimmed)),
    ]),
  ) as Record<BenchColumn, Ticket[]>
}
