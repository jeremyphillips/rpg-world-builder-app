import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import type { FilterFieldId } from '@rpg/ui/filters'

import {
  formatHideUnavailableAriaLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
} from '@/features/content/lib/campaign-access/campaign-access-table-labels'
import type { ResultSummarySupplement } from '@/lib/data-table/overview-result-summary'

import { resolveAvailabilitySummarySupplement } from './availability-summary-supplement.lib'
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

/** Visibility supplement for rows hidden or revealed by the availability filter. */
export function buildOverviewAvailabilitySupplement<TFilters>({
  scope,
  campaignAvailability,
  campaignAvailabilityFilterId,
  actions,
}: {
  scope: Pick<CampaignAvailabilityScope, 'unavailableCount'>
  campaignAvailability: CampaignAvailabilityFilter
  campaignAvailabilityFilterId: FilterFieldId<TFilters>
  actions: FilterNoticeActions<TFilters>
}): ResultSummarySupplement | null {
  const resolved = resolveAvailabilitySummarySupplement({
    mode: campaignAvailability,
    unavailableCount: scope.unavailableCount,
  })
  if (!resolved) return null

  const showingUnavailable = resolved.actionLabel === 'Hide'

  return {
    label: resolved.label,
    action: {
      label: resolved.actionLabel,
      accessibleName: showingUnavailable
        ? formatHideUnavailableAriaLabel()
        : formatShowAllCampaignAvailabilityAriaLabel(),
      onClick: () =>
        actions.setFilterValue(
          campaignAvailabilityFilterId,
          (showingUnavailable ? 'available' : 'all') as TFilters[FilterFieldId<TFilters>],
          { history: 'push' },
        ),
    },
  }
}
