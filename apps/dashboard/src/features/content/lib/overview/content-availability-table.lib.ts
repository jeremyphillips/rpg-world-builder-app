import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'

import {
  campaignAvailabilityFilterFn,
  deriveCampaignAvailabilityScope as deriveGenericCampaignAvailabilityScope,
  type CampaignAvailabilityScope,
} from '@/lib/overview/campaign-availability-scope.lib'

import type { ContentBase } from './content-table-config'
import { matchesPrimaryTextQuery } from '@rpg/ui/lib/search-document'

/** Column filter id for campaign availability — shared across overview tables. */
export const CAMPAIGN_AVAILABILITY_FILTER_ID = 'campaignAvailability' as const

export type ContentOverviewFilterState = {
  name?: string
  source?: string
  status?: string
  campaignAvailability: CampaignAvailabilityFilter
}

export type { CampaignAvailabilityScope }

export { campaignAvailabilityFilterFn }

export const DEFAULT_CONTENT_OVERVIEW_FILTER_STATE: ContentOverviewFilterState = {
  campaignAvailability: CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
}

export function matchesContentOverviewFilters<T extends WithCampaignAccess<ContentBase>>(
  row: T,
  filters: ContentOverviewFilterState,
  options?: { excludeCampaignAvailability?: boolean },
): boolean {
  if (filters.name?.trim()) {
    if (!matchesPrimaryTextQuery(row.name, filters.name, 'forgiving')) return false
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
  return deriveGenericCampaignAvailabilityScope(scopedRows, {
    isAvailable: (row) => row.campaignAccess.available,
    filterValue: filters.campaignAvailability,
  })
}

export function getCampaignAccessFromRow<
  T extends { campaignAccess: ResolvedContentCampaignAccess },
>(row: T): ResolvedContentCampaignAccess {
  return row.campaignAccess
}
