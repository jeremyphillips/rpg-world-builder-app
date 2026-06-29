import type { Epic, Ticket, TicketArea, TicketSize } from '@rpg/contracts/dev-bench'

import { TICKET_PRIORITY_WEIGHT } from './priority-weight'
import { compareTicketsByPriorityUpdatedKey } from './ticket-compare'

export type RecommendContext = {
  epicId?: string
  area?: TicketArea
}

const SIZE_PENALTY: Record<TicketSize, number> = {
  xs: 0,
  s: 0,
  m: 0,
  l: 1,
  xl: 2,
}

const ELIGIBLE_STATUSES = new Set<Ticket['status']>(['backlog', 'up_next'])

function buildEpicLookup(epics: Epic[]): Map<string, Epic> {
  return new Map(epics.map((epic) => [epic.id, epic]))
}

export function isTicketEligibleForRecommendation(
  ticket: Ticket,
  context?: RecommendContext,
): boolean {
  if (!ELIGIBLE_STATUSES.has(ticket.status)) return false
  if (ticket.status === 'blocked') return false
  if (ticket.blockedByTicketIds.length > 0) return false
  if (context?.epicId !== undefined && ticket.epicId !== context.epicId) return false
  if (context?.area !== undefined && ticket.area !== context.area) return false
  return true
}

export function scoreTicketForRecommendation(
  ticket: Ticket,
  epics: Epic[],
  context?: RecommendContext,
): number {
  const epicLookup = buildEpicLookup(epics)
  let score = TICKET_PRIORITY_WEIGHT[ticket.priority]

  if (ticket.status === 'up_next') score += 2

  if (ticket.epicId) {
    const epic = epicLookup.get(ticket.epicId)
    if (epic?.status === 'active') score += 3
  }

  score += 2

  if (context?.epicId !== undefined && ticket.epicId === context.epicId) score += 5
  if (context?.area !== undefined && ticket.area === context.area) score += 3

  score -= SIZE_PENALTY[ticket.size]

  return score
}

export function suggestNextTicket(
  tickets: Ticket[],
  epics: Epic[],
  context?: RecommendContext,
): Ticket | null {
  const eligible = tickets.filter((ticket) => isTicketEligibleForRecommendation(ticket, context))
  if (eligible.length === 0) return null

  const scored = eligible.map((ticket) => ({
    ticket,
    score: scoreTicketForRecommendation(ticket, epics, context),
  }))

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return compareTicketsByPriorityUpdatedKey(a.ticket, b.ticket)
  })

  return scored[0]!.ticket
}
