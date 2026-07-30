import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import type { FilterFieldId } from '@rpg/ui/filters'

import {
  CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL,
  formatNoAvailableMatchesLabel,
  formatShowUnavailableAriaLabel,
  formatUnavailableMatchesLine,
} from '@/features/content/lib/campaign-access/campaign-access-table-labels'
import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'
import { CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID } from '@/lib/overview/overview-availability-supplement.client'

type FilterNoticeActions<TFilters> = {
  setFilterValue: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>],
    options?: { history?: 'push' },
  ) => void
}

export function buildVocabularyOverviewEmptyState<TFilters>({
  campaignAvailability,
  scope,
  pluralNoun,
  actions,
}: {
  campaignAvailability: CampaignAvailabilityFilter
  scope: Pick<CampaignAvailabilityScope, 'unavailableCount' | 'visibleCount'>
  pluralNoun: string
  actions: FilterNoticeActions<TFilters>
}) {
  if (
    campaignAvailability === 'available' &&
    scope.unavailableCount > 0 &&
    scope.visibleCount === 0
  ) {
    const campaignAvailabilityFilterId =
      CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID as FilterFieldId<TFilters>

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
