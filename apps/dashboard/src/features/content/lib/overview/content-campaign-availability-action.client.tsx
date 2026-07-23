'use client'

import { CircleSlash } from 'lucide-react'
import { Switch, Text } from '@rpg/ui'

import {
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT,
  CAMPAIGN_ACCESS_SECTION_LEGEND,
} from '../campaign-access/campaign-access-labels'
import {
  CAMPAIGN_ACCESS_TABLE_AVAILABLE_HELPER,
  CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL,
} from '../campaign-access/campaign-access-table-labels'

export type ContentCampaignAvailabilityActionProps = {
  available: boolean
  onAvailableChange: (available: boolean) => void
  pending?: boolean
  sectionLegend?: string
}

function AvailabilityStatusIndicator({ available }: { available: boolean }) {
  if (available) {
    return <span aria-hidden className="size-2 shrink-0 rounded-full bg-semantic-success" />
  }

  return <CircleSlash aria-hidden className="size-3.5 shrink-0 text-semantic-warning" />
}

function availabilitySwitchLabel(available: boolean): string {
  return available ? CAMPAIGN_ACCESS_AVAILABLE_LABEL : CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL
}

function availabilityHelperCopy(available: boolean): string {
  return available
    ? CAMPAIGN_ACCESS_TABLE_AVAILABLE_HELPER
    : CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT
}

/**
 * Campaign availability editor for content overview row-action popovers.
 * Render inside `RowActionsMenu` `footer`.
 */
export function ContentCampaignAvailabilityAction({
  available,
  onAvailableChange,
  pending = false,
  sectionLegend = CAMPAIGN_ACCESS_SECTION_LEGEND,
}: ContentCampaignAvailabilityActionProps) {
  const statusLabel = availabilitySwitchLabel(available)
  const helperCopy = availabilityHelperCopy(available)

  return (
    <div className="w-full px-2 py-2">
      <Text as="p" variant="muted" className="text-xs font-medium">
        {sectionLegend}
      </Text>

      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <AvailabilityStatusIndicator available={available} />
            <span
              className={
                available
                  ? 'text-xs font-medium text-foreground'
                  : 'text-xs font-medium text-semantic-warning'
              }
            >
              {statusLabel}
            </span>
          </div>
          <Text as="p" variant="muted" className="text-xs leading-snug">
            {helperCopy}
          </Text>
        </div>

        <Switch
          checked={available}
          disabled={pending}
          onCheckedChange={onAvailableChange}
          aria-label={`${statusLabel} in this campaign`}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 h-4 w-7 shrink-0 [&>[data-state]]:size-3 [&>[data-state=checked]]:translate-x-3"
        />
      </div>
    </div>
  )
}
