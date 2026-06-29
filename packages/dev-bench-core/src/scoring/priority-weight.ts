import type { TicketPriority } from '@rpg/contracts/dev-bench'

export const TICKET_PRIORITY_WEIGHT: Record<TicketPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}
