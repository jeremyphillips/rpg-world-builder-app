import type { CampaignAvailabilityFilter } from '@rpg/contracts'

import {
  deriveCampaignAvailabilityScope,
  type CampaignAvailabilityScope,
} from '@/lib/overview/campaign-availability-scope.lib'

import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'

export type MasterDetailAvailabilityFilterOptions = {
  showUnavailable: boolean
  pinnedRowId?: string | null
}

function masterDetailFilterValue(showUnavailable: boolean): CampaignAvailabilityFilter {
  return showUnavailable ? 'all' : 'available'
}

export function deriveMasterDetailAvailabilityScope(
  items: readonly MasterDetailAvailabilityPresentation[],
  showUnavailable: boolean,
): CampaignAvailabilityScope {
  return deriveCampaignAvailabilityScope([...items], {
    isAvailable: (row) => row.isAvailable,
    filterValue: masterDetailFilterValue(showUnavailable),
  })
}

export function filterMasterDetailItems<T extends MasterDetailAvailabilityPresentation>(
  items: readonly T[],
  options: MasterDetailAvailabilityFilterOptions,
): T[] {
  return items.filter((item) => {
    if (item.isAvailable) return true
    if (options.showUnavailable) return true
    if (options.pinnedRowId && item.rowId === options.pinnedRowId) return true
    return false
  })
}

export function resolveMasterDetailPinnedRowId(
  items: readonly MasterDetailAvailabilityPresentation[],
  selectedRowId: string | null,
  showUnavailable: boolean,
): string | null {
  if (!selectedRowId) return null

  const selected = items.find((item) => item.rowId === selectedRowId)
  if (!selected) return null
  if (selected.isAvailable) return null
  if (showUnavailable) return null

  return selectedRowId
}
