import type { CampaignAvailabilityFilter } from '@rpg/contracts'

export type CampaignAvailabilityScope = {
  availableCount: number
  unavailableCount: number
  visibleCount: number
}

export function campaignAvailabilityFilterFn(
  available: boolean,
  filter: CampaignAvailabilityFilter,
): boolean {
  if (filter === 'all') return true
  if (filter === 'available') return available
  return !available
}

export function deriveCampaignAvailabilityScope<T>(
  scopedRows: T[],
  input: {
    isAvailable: (row: T) => boolean
    filterValue: CampaignAvailabilityFilter
  },
): CampaignAvailabilityScope {
  const availableCount = scopedRows.filter((row) => input.isAvailable(row)).length
  const unavailableCount = scopedRows.length - availableCount
  const visibleCount = scopedRows.filter((row) =>
    campaignAvailabilityFilterFn(input.isAvailable(row), input.filterValue),
  ).length

  return { availableCount, unavailableCount, visibleCount }
}
