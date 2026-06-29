import type { TicketStatus } from '@rpg/contracts/dev-bench'

/** Ticket statuses excluded from API/CLI `bucket=active` (incomplete work filter). */
export const CLOSED_TICKET_STATUSES = ['done', 'wont_do'] as const satisfies readonly TicketStatus[]

/** Active work: backlog plus on-desk — not done and not wont_do. */
export function isActiveTicketStatus(status: TicketStatus): boolean {
  return status !== 'done' && status !== 'wont_do'
}
