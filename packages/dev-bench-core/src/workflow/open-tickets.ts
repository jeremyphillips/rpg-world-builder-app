import type { TicketStatus } from '@rpg/contracts/dev-bench'

/** Ticket statuses excluded from API/CLI `bucket=open` (incomplete work filter). */
export const CLOSED_TICKET_STATUSES = ['done', 'wont_do'] as const satisfies readonly TicketStatus[]

/** Incomplete work: backlog plus on-desk — not done and not wont_do. */
export function isOpenTicketStatus(status: TicketStatus): boolean {
  return status !== 'done' && status !== 'wont_do'
}
