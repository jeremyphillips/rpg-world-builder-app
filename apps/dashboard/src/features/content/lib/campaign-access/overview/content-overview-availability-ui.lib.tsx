import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import type { FilterFieldId } from '@rpg/ui/filters'

import {
  CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL,
  formatShowUnavailableAriaLabel,
} from '../campaign-access-table-labels'
import { buildOverviewAvailabilitySupplement } from '@/lib/overview/overview-availability-supplement'
import { resolveAvailabilityFilteredEmptyCopy } from '@/lib/overview/availability-empty-state-copy.lib'
import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'

type AvailabilityScope = CampaignAvailabilityScope

type FilterNoticeActions<TFilters> = {
  setFilterValue: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>],
    options?: { history?: 'push' },
  ) => void
}

/** Utility-row supplemental copy for filter-scoped hidden unavailable counts. */
export function buildContentOverviewHiddenSupplement<TFilters>({
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
  return buildOverviewAvailabilitySupplement({
    scope,
    campaignAvailability,
    campaignAvailabilityFilterId,
    actions,
  })
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
  const copy = resolveAvailabilityFilteredEmptyCopy({
    campaignAvailability,
    unavailableCount: scope.unavailableCount,
    visibleCount: scope.visibleCount,
    pluralNoun,
  })

  if (copy.kind === 'hiddenUnavailable') {
    return (
      <div className="space-y-1 text-center">
        <p>{copy.noMatchesLine}</p>
        <p className="text-muted-foreground">
          {copy.unavailableLine}{' '}
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

  if (copy.kind === 'generic') {
    return <p>No results.</p>
  }

  return <p>No results.</p>
}
