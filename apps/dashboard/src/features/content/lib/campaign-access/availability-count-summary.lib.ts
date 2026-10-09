import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { formatUnavailableCountLabel } from '@/lib/overview/availability-summary-supplement.lib'

/**
 * Master-detail count line. Overview result summaries use `ResultSummary` instead.
 *
 * Surface-owned nouns that intentionally stay local:
 * - Game Terms vocabulary hub (`N terms`, see vocabulary-hub.tsx)
 * - Empty-state notices with content-specific plural nouns
 */

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
  return formatUnavailableCountLabel(count)
}

/** Joins non-empty summary fragments with the shared separator. */
export function joinAvailabilityCountSummarySegments(
  segments: readonly (string | null | undefined)[],
): string {
  return joinInlineMetadata(segments)
}

/** Joins non-zero availability buckets for the master-detail count line. */
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
 * Master-detail stable supplement — pair counts with zero-bucket suppression.
 * Renders nothing for an empty collection.
 */
export function resolveStableMasterDetailCountSummaryParts(input: {
  availableCount: number
  unavailableCount: number
}): AvailabilityCountSummaryParts | null {
  const totalCount = input.availableCount + input.unavailableCount
  if (totalCount <= 0) return null

  const summary = formatAvailabilityCountSummary(input.availableCount, input.unavailableCount)
  if (!summary) return null

  return {
    segments: [summary],
    showUnavailableToggle: input.unavailableCount > 0,
  }
}
