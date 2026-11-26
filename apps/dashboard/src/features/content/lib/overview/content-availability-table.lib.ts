import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'

import {
  campaignAvailabilityFilterFn,
  type CampaignAvailabilityScope,
} from '@/lib/overview/campaign-availability-scope.lib'

import { isContentOverlayFailureOverviewRow } from '../list/content-overlay-overview.lib'

import type { ContentBase } from './content-table-config'
import { matchesPrimaryTextQuery } from '@rpg/ui/lib/search-document'

/** Column filter id for campaign availability — shared across overview tables. */
export const CAMPAIGN_AVAILABILITY_FILTER_ID = 'campaignAvailability' as const

export type ContentOverviewFilterState = {
  name?: string
  catalogLayer?: string
  status?: string
  campaignAvailability: CampaignAvailabilityFilter
}

export type { CampaignAvailabilityScope }

export { campaignAvailabilityFilterFn }

export const DEFAULT_CONTENT_OVERVIEW_FILTER_STATE: ContentOverviewFilterState = {
  campaignAvailability: CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
}

/** Overlay resolve failures are not campaign-unavailability; keep them visible on the default filter. */
export function contentRowPassesCampaignAvailabilityFilter<
  T extends WithCampaignAccess<ContentBase>,
>(row: T, filter: CampaignAvailabilityFilter): boolean {
  if (isContentOverlayFailureOverviewRow(row)) {
    return filter === 'available' || filter === 'all'
  }
  return campaignAvailabilityFilterFn(row.campaignAccess.available, filter)
}

export function matchesContentOverviewFilters<T extends WithCampaignAccess<ContentBase>>(
  row: T,
  filters: ContentOverviewFilterState,
  options?: { excludeCampaignAvailability?: boolean },
): boolean {
  if (filters.name?.trim()) {
    if (!matchesPrimaryTextQuery(row.name, filters.name, 'forgiving')) return false
  }

  if (filters.catalogLayer && row.catalogLayer !== filters.catalogLayer) return false
  if (filters.status && row.status !== filters.status) return false

  if (!options?.excludeCampaignAvailability) {
    if (!contentRowPassesCampaignAvailabilityFilter(row, filters.campaignAvailability)) {
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

export function deriveCampaignAvailabilityScope<T extends WithCampaignAccess<ContentBase>>(
  scopedRows: T[],
  filters: Pick<ContentOverviewFilterState, 'campaignAvailability'>,
): CampaignAvailabilityScope {
  const campaignRows = scopedRows.filter((row) => !isContentOverlayFailureOverviewRow(row))
  const availableCount = campaignRows.filter((row) => row.campaignAccess.available).length
  const unavailableCount = campaignRows.length - availableCount
  const visibleCount = scopedRows.filter((row) =>
    contentRowPassesCampaignAvailabilityFilter(row, filters.campaignAvailability),
  ).length

  return { availableCount, unavailableCount, visibleCount }
}

export function getCampaignAccessFromRow<
  T extends { campaignAccess: ResolvedContentCampaignAccess },
>(row: T): ResolvedContentCampaignAccess {
  return row.campaignAccess
}
