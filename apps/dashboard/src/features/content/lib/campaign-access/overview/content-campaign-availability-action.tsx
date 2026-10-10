import { InlineInactiveStatus, StatusDot, Switch, Text } from '@rpg/ui'

import {
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT,
  CAMPAIGN_ACCESS_SECTION_LEGEND,
} from '../campaign-access-labels'
import {
  CAMPAIGN_ACCESS_TABLE_AVAILABLE_HELPER,
  CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL,
} from '../campaign-access-table-labels'

export type ContentCampaignAvailabilityActionProps = {
  available: boolean
  onAvailableChange: (available: boolean) => void
  pending?: boolean
  sectionLegend?: string
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
          <div className="text-xs">
            {available ? (
              <span className="inline-flex font-medium text-foreground">
                <StatusDot tone="success" size="sm" label={statusLabel} />
              </span>
            ) : (
              <InlineInactiveStatus label={statusLabel} />
            )}
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
          className="mt-0.5 shrink-0"
        />
      </div>
    </div>
  )
}
