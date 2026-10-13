import type { EntitySummaryStatusItem } from './entity-summary-status.types'

export type EntitySummaryMetadataSegment =
  | { kind: 'badge-group'; badges: readonly EntitySummaryStatusItem[] }
  | { kind: 'status'; item: EntitySummaryStatusItem }

/** Collapse consecutive badges into one metadata segment; preserve input order. */
export function groupEntitySummaryStatusForMetadata(
  items: readonly EntitySummaryStatusItem[],
): EntitySummaryMetadataSegment[] {
  const segments: EntitySummaryMetadataSegment[] = []
  let badgeRun: EntitySummaryStatusItem[] = []

  const flushBadges = () => {
    if (badgeRun.length === 0) return
    segments.push({ kind: 'badge-group', badges: badgeRun })
    badgeRun = []
  }

  for (const item of items) {
    if (item.kind === 'badge') {
      badgeRun.push(item)
      continue
    }
    flushBadges()
    segments.push({ kind: 'status', item })
  }
  flushBadges()

  return segments
}
