import type { ReactNode } from 'react'
import { Button } from '@rpg/ui'

import { OverviewResultSummaryDotSeparator } from '@/lib/data-table/overview-result-summary'
import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'

import {
  CAMPAIGN_ACCESS_TABLE_HIDE_LABEL,
  CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  formatAvailabilityCountSummary,
  formatHideUnavailableAriaLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatShowUnavailableAriaLabel,
} from './campaign-access-table-labels'

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

/** Shared available/unavailable count row with optional Show/Hide affordance. */
export function buildAvailabilityCountSupplement(
  options: BuildAvailabilityCountSupplementOptions,
): ReactNode {
  const { scope, showUnavailable, onShow, onHide, layout, actionVariant, pluralNoun } = options

  if (layout === 'conditional' && scope.unavailableCount === 0) {
    return null
  }

  const countLine = formatAvailabilityCountSummary(scope.availableCount, scope.unavailableCount)

  return (
    <>
      <span>{countLine}</span>
      <AvailabilityCountSupplementActions
        showUnavailable={showUnavailable}
        unavailableCount={scope.unavailableCount}
        onShow={onShow}
        onHide={onHide}
        actionVariant={actionVariant}
        pluralNoun={pluralNoun}
      />
    </>
  )
}
