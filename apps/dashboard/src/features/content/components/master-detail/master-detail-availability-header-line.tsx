import { Button, InlineInactiveStatus } from '@rpg/ui'

import { OverviewResultSummaryDotSeparator } from '@/lib/data-table/overview-result-summary'
import { CAMPAIGN_ACCESS_CHANGE_LABEL } from '../../lib/campaign-access/campaign-access-labels'
import type { MasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import {
  masterDetailAvailabilityAvailableDotClasses,
  masterDetailAvailabilityAvailableStatusClasses,
  masterDetailAvailabilityHeaderChangeClasses,
  masterDetailAvailabilityHeaderLineClasses,
  masterDetailAvailabilityHeaderStatusClasses,
} from './master-detail-availability-header-line.variants'

export interface MasterDetailAvailabilityHeaderLineProps {
  availability: MasterDetailAvailabilityPresentation
  onAvailabilityChange: () => void
  changeLabel?: string
  disabled?: boolean
}

/** Presentation-only broad availability row for master-detail editor headers. */
export function MasterDetailAvailabilityHeaderLine({
  availability,
  onAvailabilityChange,
  changeLabel = CAMPAIGN_ACCESS_CHANGE_LABEL,
  disabled = false,
}: MasterDetailAvailabilityHeaderLineProps) {
  return (
    <div className={masterDetailAvailabilityHeaderLineClasses}>
      <span className={masterDetailAvailabilityHeaderStatusClasses}>
        {availability.isAvailable ? (
          <span className={masterDetailAvailabilityAvailableStatusClasses}>
            <span
              aria-hidden
              className={masterDetailAvailabilityAvailableDotClasses({ tone: 'success' })}
            />
            {availability.statusLabel}
          </span>
        ) : (
          <InlineInactiveStatus label={availability.statusLabel} />
        )}
      </span>
      <OverviewResultSummaryDotSeparator />
      <Button
        type="button"
        variant="link"
        size="sm"
        className={masterDetailAvailabilityHeaderChangeClasses}
        disabled={disabled}
        onClick={onAvailabilityChange}
      >
        {changeLabel}
      </Button>
    </div>
  )
}
