import type { TicketStatus } from '@rpg/contracts/dev-bench'

export const BENCH_COLUMNS = ['up_next', 'in_progress', 'blocked', 'done'] as const

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
