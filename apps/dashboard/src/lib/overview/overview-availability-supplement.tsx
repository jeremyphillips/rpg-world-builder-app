import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import type { FilterFieldId } from '@rpg/ui/filters'

import {
  CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  formatHiddenUnavailableNotice,
  formatHideUnavailableAriaLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatUnavailableItemsShownNotice,
} from '@/features/content/lib/campaign-access/campaign-access-table-labels'
import { OverviewResultSummaryDotSeparator } from '@/lib/data-table/overview-result-summary'

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
  if (scope.unavailableCount === 0 || campaignAvailability === 'unavailable') return null

  if (campaignAvailability === 'available') {
    return (
      <>
        <span>{formatHiddenUnavailableNotice(scope.unavailableCount)}</span>
        <OverviewResultSummaryDotSeparator />
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 text-xs"
          aria-label={formatShowAllCampaignAvailabilityAriaLabel()}
          onClick={() =>
            actions.setFilterValue(
              campaignAvailabilityFilterId,
              'all' as TFilters[FilterFieldId<TFilters>],
              { history: 'push' },
            )
          }
        >
          {CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL}
        </Button>
      </>
    )
  }

  if (campaignAvailability === 'all') {
    return (
      <>
        <span>{formatUnavailableItemsShownNotice(scope.unavailableCount)}</span>
        <OverviewResultSummaryDotSeparator />
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 text-xs"
          aria-label={formatHideUnavailableAriaLabel()}
          onClick={() =>
            actions.setFilterValue(
              campaignAvailabilityFilterId,
              'available' as TFilters[FilterFieldId<TFilters>],
              { history: 'push' },
            )
          }
        >
          {CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL}
        </Button>
      </>
    )
  }

  return null
}
