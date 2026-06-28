import { getTicketStatusLabel, type TicketStatus } from '@rpg/contracts/dev-bench'

const OFF_BENCH_MOVE_LABELS: Partial<Record<TicketStatus, string>> = {
  backlog: 'Move to Backlog',
  wont_do: "Mark Won't Do",
}

/** Card overflow menu label for a status move target. */
export function getMoveStatusMenuLabel(status: TicketStatus): string {
  const offBenchLabel = OFF_BENCH_MOVE_LABELS[status]
  if (offBenchLabel) return offBenchLabel
  return `Move to ${getTicketStatusLabel(status)}`
}
