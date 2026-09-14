import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import type { FilterFieldId } from '@rpg/ui/filters'

import { buildAvailabilityCountSupplement } from '@/features/content/lib/campaign-access/availability-count-supplement'

import type { CampaignAvailabilityScope } from './campaign-availability-scope.lib'

/** Filter field id for the shared campaign availability equals filter. */
export const CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID = 'campaignAvailability' as const

type FilterNoticeActions<TFilters> = {
  setFilterValue: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>],
    options?: { history?: 'push' },
  ) => void
}

/** Utility-row supplemental copy for filter-scoped hidden unavailable counts. */
export function buildOverviewAvailabilitySupplement<TFilters>({
  scope,
  campaignAvailability,
  campaignAvailabilityFilterId,
  actions,
}: {
  scope: CampaignAvailabilityScope
  campaignAvailability: CampaignAvailabilityFilter
  campaignAvailabilityFilterId: FilterFieldId<TFilters>
  actions: FilterNoticeActions<TFilters>
}) {
  if (campaignAvailability === 'unavailable') return null

  return buildAvailabilityCountSupplement({
    scope,
    showUnavailable: campaignAvailability === 'all',
    layout: 'conditional',
    actionVariant: 'overview',
    onShow: () =>
      actions.setFilterValue(
        campaignAvailabilityFilterId,
        'all' as TFilters[FilterFieldId<TFilters>],
        { history: 'push' },
      ),
    onHide: () =>
      actions.setFilterValue(
        campaignAvailabilityFilterId,
        'available' as TFilters[FilterFieldId<TFilters>],
        { history: 'push' },
      ),
  })
}
