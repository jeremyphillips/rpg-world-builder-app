import { ActionIcon, Button, InlineInactiveStatus } from '@rpg/ui'

import { OverviewResultSummaryDotSeparator } from '@/lib/data-table/overview-result-summary-dot-separator'
import { CAMPAIGN_ACCESS_CHANGE_LABEL } from '../../lib/campaign-access/campaign-access-labels'
import type { MasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'

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
    <div className="flex flex-wrap items-center gap-x-1 text-style-caption">
      <span className="flex min-w-0 items-center gap-1.5">
        {availability.isAvailable ? (
          <span className="inline-flex min-w-0 items-center gap-1 text-style-label">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-semantic-success" />
            {availability.statusLabel}
          </span>
        ) : (
          <InlineInactiveStatus label={availability.statusLabel} />
        )}
      </span>
      <OverviewResultSummaryDotSeparator />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onAvailabilityChange}
        aria-label={changeLabel}
      >
        <ActionIcon action="edit" size="sm" className="text-muted-foreground" />
      </Button>
    </div>
  )
}
