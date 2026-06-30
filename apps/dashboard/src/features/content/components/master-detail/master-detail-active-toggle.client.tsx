'use client'

import { Switch, InfoTooltip } from '@rpg/ui'

import {
  ACTIVE_IN_CAMPAIGN_LABEL,
  ACTIVE_IN_CAMPAIGN_TOOLTIP,
} from '../../lib/master-detail/content-campaign-availability'

export interface MasterDetailActiveToggleProps {
  controlId: string
  activeInCampaign: boolean
  onActiveChange: (active: boolean) => void
}

export function MasterDetailActiveToggle({
  controlId,
  activeInCampaign,
  onActiveChange,
}: MasterDetailActiveToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={controlId} className="text-sm font-medium">
        {ACTIVE_IN_CAMPAIGN_LABEL}
      </label>
      <InfoTooltip aria-label={`About: ${ACTIVE_IN_CAMPAIGN_LABEL}`}>
        {ACTIVE_IN_CAMPAIGN_TOOLTIP}
      </InfoTooltip>
      <Switch
        id={controlId}
        checked={activeInCampaign}
        onCheckedChange={onActiveChange}
        aria-label={ACTIVE_IN_CAMPAIGN_LABEL}
      />
    </div>
  )
}
