import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import type { FilterFieldId } from '@rpg/ui/filters'

import {
  CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL,
  formatHiddenUnavailableNotice,
  formatHideUnavailableAriaLabel,
  formatNoAvailableMatchesLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatShowUnavailableAriaLabel,
  formatUnavailableItemsShownNotice,
  formatUnavailableMatchesLine,
} from '../campaign-access/campaign-access-table-labels'

type AvailabilityScope = {
  unavailableCount: number
  visibleCount: number
}

type FilterNoticeActions<TFilters> = {
  setFilterValue: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>],
    options?: { history?: 'push' },
  ) => void
}

export function buildContentOverviewFilterNotice<TFilters>({
  scope,
  campaignAvailability,
  campaignAvailabilityFilterId,
  actions,
}: {
  scope: AvailabilityScope
  campaignAvailability: CampaignAvailabilityFilter
  campaignAvailabilityFilterId: FilterFieldId<TFilters>
  actions: FilterNoticeActions<TFilters>
}) {
  if (scope.unavailableCount === 0) return null

  if (campaignAvailability === 'available') {
    return (
      <>
        <span>{formatHiddenUnavailableNotice(scope.unavailableCount)}</span>
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
        <span>{formatUnavailableItemsShownNotice()}</span>
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

export function buildContentOverviewEmptyState<TFilters>({
  campaignAvailability,
  scope,
  pluralNoun,
  campaignAvailabilityFilterId,
  actions,
}: {
  campaignAvailability: CampaignAvailabilityFilter
  scope: AvailabilityScope
  pluralNoun: string
  campaignAvailabilityFilterId: FilterFieldId<TFilters>
  actions: FilterNoticeActions<TFilters>
}) {
  if (
    campaignAvailability === 'available' &&
    scope.unavailableCount > 0 &&
    scope.visibleCount === 0
  ) {
    return (
      <div className="space-y-1 text-center">
        <p>{formatNoAvailableMatchesLabel(pluralNoun)}</p>
        <p className="text-muted-foreground">
          {formatUnavailableMatchesLine(scope.unavailableCount, pluralNoun)}{' '}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs"
            aria-label={formatShowUnavailableAriaLabel(pluralNoun)}
            onClick={() =>
              actions.setFilterValue(
                campaignAvailabilityFilterId,
                'unavailable' as TFilters[FilterFieldId<TFilters>],
              )
            }
          >
            {CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL}
          </Button>
        </p>
      </div>
    )
  }

  return <p>No results.</p>
}
