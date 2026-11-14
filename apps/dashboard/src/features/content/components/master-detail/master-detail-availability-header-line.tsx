import { ActionIcon, Button, InlineInactiveStatus } from '@rpg/ui'

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
          <span className="inline-flex min-w-0 items-center gap-1 text-style-caption">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-semantic-success" />
            {availability.statusLabel}
          </span>
        ) : (
          <InlineInactiveStatus label={availability.statusLabel} />
        )}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled}
        onClick={onAvailabilityChange}
        aria-label={changeLabel}
      >
        <ActionIcon action="edit" size="xs" className="text-muted-foreground" />
      </Button>
    </div>
  )
}
