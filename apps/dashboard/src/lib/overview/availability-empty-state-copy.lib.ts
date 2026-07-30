import type { CampaignAvailabilityFilter } from '@rpg/contracts'

import {
  formatNoAvailableMatchesLabel,
  formatUnavailableMatchesLine,
} from '@/features/content/lib/campaign-access/campaign-access-table-labels'

export type AvailabilityFilteredEmptyCopy =
  | { kind: 'none' }
  | { kind: 'generic' }
  | { kind: 'hiddenUnavailable'; noMatchesLine: string; unavailableLine: string }

/** Pure copy for availability-filtered table empty states — callers own actions/JSX. */
export function resolveAvailabilityFilteredEmptyCopy(input: {
  campaignAvailability: CampaignAvailabilityFilter
  unavailableCount: number
  visibleCount: number
  pluralNoun: string
}): AvailabilityFilteredEmptyCopy {
  if (
    input.campaignAvailability === 'available' &&
    input.unavailableCount > 0 &&
    input.visibleCount === 0
  ) {
    return {
      kind: 'hiddenUnavailable',
      noMatchesLine: formatNoAvailableMatchesLabel(input.pluralNoun),
      unavailableLine: formatUnavailableMatchesLine(input.unavailableCount, input.pluralNoun),
    }
  }

  if (input.visibleCount === 0) {
    return { kind: 'generic' }
  }

  return { kind: 'none' }
}
