import type { Ticket } from '@rpg/contracts/dev-bench'

import { TICKET_PRIORITY_WEIGHT } from './priority-weight'

/** Tie-break eligible tickets: priority desc → updatedAt desc → key asc. */
export function compareTicketsByPriorityUpdatedKey(a: Ticket, b: Ticket): number {
  const priorityDiff = TICKET_PRIORITY_WEIGHT[b.priority] - TICKET_PRIORITY_WEIGHT[a.priority]
  if (priorityDiff !== 0) return priorityDiff

  const updatedDiff = b.updatedAt.localeCompare(a.updatedAt)
  if (updatedDiff !== 0) return updatedDiff

  return a.key.localeCompare(b.key)
}
