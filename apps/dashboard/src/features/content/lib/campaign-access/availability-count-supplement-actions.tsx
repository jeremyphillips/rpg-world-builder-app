import { Button } from '@rpg/ui'

import { OverviewResultSummaryDotSeparator } from '@/lib/data-table/overview-result-summary'

import {
  CAMPAIGN_ACCESS_TABLE_HIDE_LABEL,
  CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  formatHideUnavailableAriaLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatShowUnavailableAriaLabel,
} from './campaign-access-table-labels'

type AvailabilityCountSupplementActionsProps = {
  showUnavailable: boolean
  hiddenUnavailableCount: number
  unavailableCount: number
  onShow: () => void
  onHide: () => void
  actionVariant?: 'master-detail' | 'overview'
  pluralNoun?: string
}

export function AvailabilityCountSupplementActions({
  showUnavailable,
  hiddenUnavailableCount,
  unavailableCount,
  onShow,
  onHide,
  actionVariant = 'master-detail',
  pluralNoun,
}: AvailabilityCountSupplementActionsProps) {
  if (showUnavailable) {
    if (unavailableCount === 0) return null
    return (
      <>
        <OverviewResultSummaryDotSeparator />
        <Button
          type="button"
          variant="text"
          size="sm"
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

  if (hiddenUnavailableCount === 0) return null

  return (
    <>
      <OverviewResultSummaryDotSeparator />
      <Button
        type="button"
        variant="text"
        size="sm"
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
