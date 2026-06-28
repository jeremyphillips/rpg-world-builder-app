import type { Ticket } from '@rpg/contracts/dev-bench'

/** Candidate ticket shape for duplicate check before create. */
export type DuplicateProbe = Pick<Ticket, 'title' | 'area' | 'epicId' | 'codeRefs'>

const OPEN_STATUSES = new Set<Ticket['status']>(['backlog', 'up_next', 'in_progress', 'blocked'])

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase()
}

function titleTokens(title: string): Set<string> {
  const tokens = normalizeTitle(title)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3)
  return new Set(tokens)
}

function pathPrefixTwoSegments(path: string): string {
  const segments = path.split('/').filter(Boolean)
  return segments.slice(0, 2).join('/')
}

function codeRefsOverlap(probe: DuplicateProbe, existing: Ticket): number {
  let score = 0

  for (const probeRef of probe.codeRefs) {
    let matched = false

    for (const existingRef of existing.codeRefs) {
      if (probeRef.path === existingRef.path) {
        matched = true
        break
      }

      if (pathPrefixTwoSegments(probeRef.path) === pathPrefixTwoSegments(existingRef.path)) {
        matched = true
        break
      }
    }

    if (matched) score += 5
  }

  return Math.min(score, 10)
}

function scoreDuplicateMatch(probe: DuplicateProbe, existing: Ticket): number {
  let score = 0

  const probeTitle = normalizeTitle(probe.title)
  const existingTitle = normalizeTitle(existing.title)

  if (probeTitle === existingTitle) {
    score += 10
  } else {
    const probeTokens = titleTokens(probe.title)
    const existingTokens = titleTokens(existing.title)
    let shared = 0

    for (const token of probeTokens) {
      if (existingTokens.has(token)) shared += 1
    }

    score += Math.min(shared * 3, 9)
  }

  if (probe.area && existing.area && probe.area === existing.area) score += 2
  if (probe.epicId && existing.epicId && probe.epicId === existing.epicId) score += 2

  score += codeRefsOverlap(probe, existing)

  return score
}

function compareDuplicateCandidates(a: Ticket, b: Ticket, scores: Map<string, number>): number {
  const scoreDiff = (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0)
  if (scoreDiff !== 0) return scoreDiff

  const updatedDiff = b.updatedAt.localeCompare(a.updatedAt)
  if (updatedDiff !== 0) return updatedDiff

  return a.key.localeCompare(b.key)
}

export function findDuplicateCandidates(probe: DuplicateProbe, existing: Ticket[]): Ticket[] {
  const open = existing.filter((ticket) => OPEN_STATUSES.has(ticket.status))
  const scores = new Map<string, number>()

  for (const ticket of open) {
    const score = scoreDuplicateMatch(probe, ticket)
    if (score >= 5) scores.set(ticket.id, score)
  }

  return open
    .filter((ticket) => scores.has(ticket.id))
    .sort((a, b) => compareDuplicateCandidates(a, b, scores))
}
