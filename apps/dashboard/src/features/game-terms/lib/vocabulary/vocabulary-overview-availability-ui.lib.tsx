import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import type { FilterFieldId } from '@rpg/ui/filters'

import {
  CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL,
  formatShowUnavailableAriaLabel,
} from '@/features/content'
import { resolveAvailabilityFilteredEmptyCopy } from '@/lib/overview/availability-empty-state-copy.lib'
import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'
import { CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID } from '@/lib/overview/overview-availability-supplement'

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
  const copy = resolveAvailabilityFilteredEmptyCopy({
    campaignAvailability,
    unavailableCount: scope.unavailableCount,
    visibleCount: scope.visibleCount,
    pluralNoun,
  })

  if (copy.kind === 'hiddenUnavailable') {
    const campaignAvailabilityFilterId =
      CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID as FilterFieldId<TFilters>

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
