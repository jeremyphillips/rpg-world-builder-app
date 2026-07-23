import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'

import type { ContentBase } from './content-table-config'

/** Column filter id for campaign availability — shared across overview tables. */
export const CAMPAIGN_AVAILABILITY_FILTER_ID = 'campaignAvailability'

export type ContentOverviewFilterState = {
  name?: string
  source?: string
  status?: string
  campaignAvailability: CampaignAvailabilityFilter
}

export type CampaignAvailabilityScope = {
  availableCount: number
  unavailableCount: number
  visibleCount: number
}

export const DEFAULT_CONTENT_OVERVIEW_FILTER_STATE: ContentOverviewFilterState = {
  campaignAvailability: CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
}

export function campaignAvailabilityFilterFn(
  available: boolean,
  filter: CampaignAvailabilityFilter,
): boolean {
  if (filter === 'all') return true
  if (filter === 'available') return available
  return !available
}

export function matchesContentOverviewFilters<T extends WithCampaignAccess<ContentBase>>(
  row: T,
  filters: ContentOverviewFilterState,
  options?: { excludeCampaignAvailability?: boolean },
): boolean {
  if (filters.name?.trim()) {
    const query = filters.name.trim().toLowerCase()
    if (!row.name.toLowerCase().includes(query)) return false
  }

  if (filters.source && row.source !== filters.source) return false
  if (filters.status && row.status !== filters.status) return false

  if (!options?.excludeCampaignAvailability) {
    if (!campaignAvailabilityFilterFn(row.campaignAccess.available, filters.campaignAvailability)) {
      return false
    }
  }

  return true
}

export function filterContentRows<T extends WithCampaignAccess<ContentBase>>(
  data: T[],
  filters: ContentOverviewFilterState,
  options?: { excludeCampaignAvailability?: boolean },
): T[] {
  return data.filter((row) => matchesContentOverviewFilters(row, filters, options))
}

export function deriveCampaignAvailabilityScope<
  T extends { campaignAccess: ResolvedContentCampaignAccess },
>(
  scopedRows: T[],
  filters: Pick<ContentOverviewFilterState, 'campaignAvailability'>,
): CampaignAvailabilityScope {
  const availableCount = scopedRows.filter((row) => row.campaignAccess.available).length
  const unavailableCount = scopedRows.length - availableCount
  const visibleCount = scopedRows.filter((row) =>
    campaignAvailabilityFilterFn(row.campaignAccess.available, filters.campaignAvailability),
  ).length

  return { availableCount, unavailableCount, visibleCount }
}

export function getCampaignAccessFromRow<
  T extends { campaignAccess: ResolvedContentCampaignAccess },
>(row: T): ResolvedContentCampaignAccess {
  return row.campaignAccess
}
