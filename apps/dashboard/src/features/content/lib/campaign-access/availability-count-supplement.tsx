import type { ReactNode } from 'react'

import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'

import { AvailabilityCountSupplementActions } from './availability-count-supplement-actions'
import {
  joinAvailabilityCountSummarySegments,
  resolveStableMasterDetailCountSummaryParts,
} from './availability-count-summary.lib'

export type BuildAvailabilityCountSupplementOptions = {
  scope: CampaignAvailabilityScope
  showUnavailable: boolean
  onShow: () => void
  onHide: () => void
  /** Master-detail rows hidden by the unavailable filter (excludes pinned selections). */
  hiddenUnavailableCount?: number
}

/** Master-detail unavailable-count row with optional Show/Hide affordance. */
export function buildAvailabilityCountSupplement(
  options: BuildAvailabilityCountSupplementOptions,
): ReactNode {
  const {
    scope,
    showUnavailable,
    onShow,
    onHide,
    hiddenUnavailableCount = scope.unavailableCount,
  } = options
  const summaryParts = resolveStableMasterDetailCountSummaryParts({
    availableCount: scope.availableCount,
    unavailableCount: scope.unavailableCount,
  })

  if (!summaryParts) return null

  const countLine = joinAvailabilityCountSummarySegments(summaryParts.segments)
  const showToggleAction = showUnavailable ? scope.unavailableCount > 0 : hiddenUnavailableCount > 0

  return (
    <>
      <span>{countLine}</span>
      {showToggleAction ? (
        <AvailabilityCountSupplementActions
          showUnavailable={showUnavailable}
          hiddenUnavailableCount={hiddenUnavailableCount}
          unavailableCount={scope.unavailableCount}
          onShow={onShow}
          onHide={onHide}
        />
      ) : null}
    </>
  )
}
