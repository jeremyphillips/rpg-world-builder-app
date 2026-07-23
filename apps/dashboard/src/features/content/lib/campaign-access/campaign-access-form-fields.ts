import { createElement } from 'react'
import {
  CONTENT_ACCESS_CAPABILITIES,
  CONTENT_VISIBILITY_MODE_ENTRIES,
  type ContentAccessTargetType,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { CampaignAccessAvailableSwitch } from './campaign-access-available-switch.client'
import {
  campaignAccessVisibilityOptionAvailability,
  resolveCampaignAccessPlayerAccessHint,
} from './campaign-access-form-visibility'
import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
  CAMPAIGN_ACCESS_UNAVAILABLE_HINT,
} from './campaign-access-labels'

export type CampaignAccessFormCtx = {
  targetType: ContentAccessTargetType
  available: boolean
  pending: boolean
}

function buildVisibilityModeOptions(targetType: ContentAccessTargetType) {
  const capability = CONTENT_ACCESS_CAPABILITIES[targetType]
  if (capability.mode !== 'owned') return []

  return capability.visibilityModes.map((mode) => ({
    value: mode,
    label: CONTENT_VISIBILITY_MODE_ENTRIES[mode].label,
  }))
}

export function buildCampaignAccessFields(ctx: CampaignAccessFormCtx): FormItem[] {
  const availableHint = ctx.available
    ? CAMPAIGN_ACCESS_AVAILABLE_HINT
    : CAMPAIGN_ACCESS_UNAVAILABLE_HINT

  return [
    {
      kind: 'slot',
      name: 'available',
      render: () =>
        createElement(CampaignAccessAvailableSwitch, {
          label: CAMPAIGN_ACCESS_AVAILABLE_LABEL,
          hint: availableHint,
          info: CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
        }),
    },
    {
      type: 'select',
      name: 'visibilityMode',
      label: CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
      labelPosition: 'settings',
      hint: resolveCampaignAccessPlayerAccessHint(ctx),
      info: CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
      width: 'full',
      size: 'sm',
      separator: 'faint',
      disabled: !ctx.available || ctx.pending,
      options: buildVisibilityModeOptions(ctx.targetType),
      optionAvailability: campaignAccessVisibilityOptionAvailability(),
    },
  ]
}
