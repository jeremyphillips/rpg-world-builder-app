import type { ReactNode } from 'react'

import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'

import { AvailabilityCountSupplementActions } from './availability-count-supplement-actions'
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
  /** Master-detail rows hidden by the unavailable filter (excludes pinned selections). */
  hiddenUnavailableCount?: number
  /** Overview Show-unavailable aria label copy. */
  pluralNoun?: string
}

/** Shared unavailable-count row with optional Show/Hide affordance. */
export function buildAvailabilityCountSupplement(
  options: BuildAvailabilityCountSupplementOptions,
): ReactNode {
  const {
    scope,
    showUnavailable,
    onShow,
    onHide,
    layout,
    actionVariant,
    pluralNoun,
    hiddenUnavailableCount = scope.unavailableCount,
  } = options
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
  const showToggleAction =
    layout === 'stable'
      ? showUnavailable
        ? scope.unavailableCount > 0
        : hiddenUnavailableCount > 0
      : summaryParts.showUnavailableToggle

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
          actionVariant={actionVariant}
          pluralNoun={pluralNoun}
        />
      ) : null}
    </>
  )
}
