import { Button } from '@rpg/ui'

import { OverviewResultSummaryDotSeparator } from '@/lib/data-table/overview-result-summary-dot-separator'

import {
  CAMPAIGN_ACCESS_TABLE_HIDE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  formatHideUnavailableAriaLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
} from './campaign-access-table-labels'

type AvailabilityCountSupplementActionsProps = {
  showUnavailable: boolean
  hiddenUnavailableCount: number
  unavailableCount: number
  onShow: () => void
  onHide: () => void
}

export function AvailabilityCountSupplementActions({
  showUnavailable,
  hiddenUnavailableCount,
  unavailableCount,
  onShow,
  onHide,
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
          {CAMPAIGN_ACCESS_TABLE_HIDE_LABEL}
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
        aria-label={formatShowAllCampaignAvailabilityAriaLabel()}
        onClick={onShow}
      >
        {CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL}
      </Button>
    </>
  )
}
