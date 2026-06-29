import type { Epic, Ticket } from '@rpg/contracts/dev-bench'

import { TICKET_PRIORITY_WEIGHT } from '../scoring/priority-weight'

/** Collapsed epic ticket buckets — excludes wont_do from all buckets. */
export type EpicTicketBucket = 'open' | 'blocked' | 'done'

const EPIC_STATUS_ORDER: Record<Epic['status'], number> = {
  active: 0,
  paused: 1,
  done: 2,
}

const PRIORITY_WEIGHT = TICKET_PRIORITY_WEIGHT

type EpicTicketBucketInput = Pick<Ticket, 'status' | 'blockedByTicketIds'>

export function epicTicketBucket(ticket: EpicTicketBucketInput): EpicTicketBucket | null {
  switch (ticket.status) {
    case 'wont_do':
      return null
    case 'done':
      return 'done'
    case 'blocked':
      return 'blocked'
    default:
      return ticket.blockedByTicketIds.length > 0 ? 'blocked' : 'open'
  }
}

function isQualifyingEpicTicket(ticket: Ticket): boolean {
  return epicTicketBucket(ticket) !== null
}

function compareUpdatedAtDesc(a: Ticket, b: Ticket): number {
  return b.updatedAt.localeCompare(a.updatedAt)
}

export function countEpicTicketsByBucket(tickets: Ticket[]): Record<EpicTicketBucket, number> {
  const counts: Record<EpicTicketBucket, number> = { open: 0, blocked: 0, done: 0 }

  for (const ticket of tickets) {
    const bucket = epicTicketBucket(ticket)
    if (bucket) counts[bucket] += 1
  }

  return counts
}

export function groupEpicTicketsByBucket(tickets: Ticket[]): Record<EpicTicketBucket, Ticket[]> {
  const groups: Record<EpicTicketBucket, Ticket[]> = { open: [], blocked: [], done: [] }

  for (const ticket of tickets) {
    const bucket = epicTicketBucket(ticket)
    if (bucket) groups[bucket].push(ticket)
  }

  for (const bucket of Object.keys(groups) as EpicTicketBucket[]) {
    groups[bucket].sort(compareUpdatedAtDesc)
  }

  return groups
}

function codeAreaFromRef(ref: { packageName?: string; path: string }): string {
  if (ref.packageName) return ref.packageName
  const segments = ref.path.split('/').filter(Boolean)
  return segments.slice(0, 2).join('/')
}

export function deriveRelatedCodeAreas(tickets: Ticket[], limit = 5): string[] {
  const seen = new Set<string>()
  const areas: string[] = []

  for (const ticket of tickets) {
    if (!isQualifyingEpicTicket(ticket)) continue

    for (const ref of ticket.codeRefs) {
      const area = codeAreaFromRef(ref)
      if (!area || seen.has(area)) continue
      seen.add(area)
      areas.push(area)
      if (areas.length >= limit) return areas
    }
  }

  return areas
}

export function sortEpicsForDisplay(epics: Epic[]): Epic[] {
  return [...epics].sort((a, b) => {
    const statusDiff = EPIC_STATUS_ORDER[a.status] - EPIC_STATUS_ORDER[b.status]
    if (statusDiff !== 0) return statusDiff

    const aPriority = a.priority ? PRIORITY_WEIGHT[a.priority] : 0
    const bPriority = b.priority ? PRIORITY_WEIGHT[b.priority] : 0
    if (aPriority !== bPriority) return bPriority - aPriority

    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function normalizeEpicTitle(title: string): string {
  return title.trim().toLowerCase()
}

export function getRecentlyActiveTickets(tickets: Ticket[], limit = 3): Ticket[] {
  return tickets.filter(isQualifyingEpicTicket).sort(compareUpdatedAtDesc).slice(0, limit)
}
