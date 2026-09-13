import { formatOverviewResultLabel } from '@/lib/data-table/overview-selection-cluster.lib'

/**
 * Shared count-summary semantics for master-detail rails and data-table utility rows.
 *
 * Surface-owned nouns that intentionally stay local:
 * - Game Terms vocabulary hub (`N terms`, see vocabulary-hub.tsx)
 * - Empty-state notices with content-specific plural nouns
 */
/** Shared middle-dot separator for count/availability summary fragments. */
export const AVAILABILITY_COUNT_SUMMARY_SEPARATOR = ' · '

export type AvailabilityCountSummaryParts = {
  segments: string[]
  showUnavailableToggle: boolean
}

export function formatAvailableAvailabilityCount(count: number): string | null {
  if (count <= 0) return null
  return count === 1 ? '1 available' : `${count} available`
}

export function formatUnavailableAvailabilityCount(count: number): string | null {
  if (count <= 0) return null
  return count === 1 ? '1 unavailable' : `${count} unavailable`
}

/** Joins non-empty summary fragments with the shared separator. */
export function joinAvailabilityCountSummarySegments(
  segments: readonly (string | null | undefined)[],
): string {
  return segments
    .filter((segment): segment is string => Boolean(segment))
    .join(AVAILABILITY_COUNT_SUMMARY_SEPARATOR)
}

/**
 * Low-level formatter that joins non-zero availability buckets only.
 * Prefer `resolveAvailabilityCountSummaryParts` for UI summaries so surfaces
 * do not restate implied/default availability state.
 */
export function formatAvailabilityCountSummary(
  availableCount: number,
  unavailableCount: number,
): string {
  return joinAvailabilityCountSummarySegments([
    formatAvailableAvailabilityCount(availableCount),
    formatUnavailableAvailabilityCount(unavailableCount),
  ])
}

/**
 * Shared availability supplement semantics for master-detail rails and data tables.
 * Omits the summary entirely for empty collections and when no unavailable rows exist.
 */
export function resolveAvailabilityCountSummaryParts(input: {
  totalCount: number
  unavailableCount: number
}): AvailabilityCountSummaryParts | null {
  if (input.totalCount <= 0 || input.unavailableCount <= 0) return null

  const unavailable = formatUnavailableAvailabilityCount(input.unavailableCount)
  if (!unavailable) return null

  return {
    segments: [unavailable],
    showUnavailableToggle: true,
  }
}

/**
 * Data-table utility summary: visible result count plus concise unavailable copy.
 * Available rows are implied by the visible result count and are not restated.
 */
export function formatDataTableCountSummary(input: {
  visibleCount: number
  unavailableCount: number
}): string {
  const segments = [
    input.visibleCount > 0 ? formatOverviewResultLabel(input.visibleCount) : null,
    ...(resolveAvailabilityCountSummaryParts({
      totalCount: Math.max(input.visibleCount, input.unavailableCount),
      unavailableCount: input.unavailableCount,
    })?.segments ?? []),
  ].filter((segment): segment is string => Boolean(segment))

  return joinAvailabilityCountSummarySegments(segments)
}
