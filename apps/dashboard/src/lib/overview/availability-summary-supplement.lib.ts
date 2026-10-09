import type { CampaignAvailabilityFilter } from '@rpg/contracts'

export type AvailabilitySummaryInput = {
  mode: CampaignAvailabilityFilter
  unavailableCount: number
}

export type AvailabilitySummaryActionLabel = 'Show' | 'Hide'

export type AvailabilitySummarySupplement = {
  label: string
  actionLabel: AvailabilitySummaryActionLabel
}

/** Compact unavailable-count segment, for example `1 unavailable`. */
export function formatUnavailableCountLabel(count: number): string {
  return count === 1 ? '1 unavailable' : `${count} unavailable`
}

/**
 * Overview visibility supplement.
 * `unavailableCount` is rows matching the current non-availability query and filters.
 * Callers do not branch on mode.
 */
export function resolveAvailabilitySummarySupplement(
  input: AvailabilitySummaryInput,
): AvailabilitySummarySupplement | null {
  if (input.mode === 'unavailable' || input.unavailableCount <= 0) return null

  return {
    label: formatUnavailableCountLabel(input.unavailableCount),
    actionLabel: input.mode === 'all' ? 'Hide' : 'Show',
  }
}
