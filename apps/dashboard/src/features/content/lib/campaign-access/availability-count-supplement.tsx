import type { ReactNode } from 'react'
import { Button } from '@rpg/ui'

import { OverviewResultSummaryDotSeparator } from '@/lib/data-table/overview-result-summary'
import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'

import {
  CAMPAIGN_ACCESS_TABLE_HIDE_LABEL,
  CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  formatHideUnavailableAriaLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatShowUnavailableAriaLabel,
} from './campaign-access-table-labels'
import {
  joinAvailabilityCountSummarySegments,
  resolveAvailabilityCountSummaryParts,
  resolveStableMasterDetailCountSummaryParts,
} from './availability-count-summary.lib'

export type AvailabilityCountSupplementLayout = 'stable' | 'conditional'

export type AvailabilityCountSupplementActionVariant = 'master-detail' | 'overview'

export type BuildAvailabilityCountSupplementOptions = {
  scope: CampaignAvailabilityScope
  showUnavailable: boolean
  onShow: () => void
  onHide: () => void
  layout: AvailabilityCountSupplementLayout
  actionVariant?: AvailabilityCountSupplementActionVariant
  /** Overview Show-unavailable aria label copy. */
  pluralNoun?: string
}

function AvailabilityCountSupplementActions({
  showUnavailable,
  unavailableCount,
  onShow,
  onHide,
  actionVariant = 'master-detail',
  pluralNoun,
}: Pick<
  BuildAvailabilityCountSupplementOptions,
  'showUnavailable' | 'onShow' | 'onHide' | 'actionVariant' | 'pluralNoun'
> & { unavailableCount: number }) {
  if (unavailableCount === 0) return null

  if (showUnavailable) {
    return (
      <>
        <OverviewResultSummaryDotSeparator />
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 text-xs"
          aria-label={formatHideUnavailableAriaLabel()}
          onClick={onHide}
        >
          {actionVariant === 'overview'
            ? CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL
            : CAMPAIGN_ACCESS_TABLE_HIDE_LABEL}
        </Button>
      </>
    )
  }

  return (
    <>
      <OverviewResultSummaryDotSeparator />
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto px-0 text-xs"
        aria-label={
          actionVariant === 'overview' && pluralNoun
            ? formatShowUnavailableAriaLabel(pluralNoun)
            : formatShowAllCampaignAvailabilityAriaLabel()
        }
        onClick={onShow}
      >
        {CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL}
      </Button>
    </>
  )
}

/** Shared unavailable-count row with optional Show/Hide affordance. */
export function buildAvailabilityCountSupplement(
  options: BuildAvailabilityCountSupplementOptions,
): ReactNode {
  const { scope, showUnavailable, onShow, onHide, layout, actionVariant, pluralNoun } = options
  const totalCount = scope.availableCount + scope.unavailableCount
  const summaryParts =
    layout === 'stable'
      ? resolveStableMasterDetailCountSummaryParts({
          availableCount: scope.availableCount,
          unavailableCount: scope.unavailableCount,
        })
      : resolveAvailabilityCountSummaryParts({
          totalCount,
          unavailableCount: scope.unavailableCount,
        })

  if (!summaryParts) return null

  const countLine = joinAvailabilityCountSummarySegments(summaryParts.segments)

  return (
    <>
      <span>{countLine}</span>
      {summaryParts.showUnavailableToggle ? (
        <AvailabilityCountSupplementActions
          showUnavailable={showUnavailable}
          unavailableCount={scope.unavailableCount}
          onShow={onShow}
          onHide={onHide}
          actionVariant={actionVariant}
          pluralNoun={pluralNoun}
        />
      ) : null}
    </>
  )
}
