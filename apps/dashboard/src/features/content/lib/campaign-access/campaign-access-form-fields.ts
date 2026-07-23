import { createElement } from 'react'
import {
  CONTENT_ACCESS_CAPABILITIES,
  CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED,
  CONTENT_VISIBILITY_MODE_ENTRIES,
  CONTENT_VISIBILITY_MODE_TERM,
  CONTENT_VISIBILITY_SELECT_HINT,
  type ContentAccessTargetType,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { CampaignAccessAvailableSwitch } from './campaign-access-available-switch.client'
import { campaignAccessVisibilityOptionAvailability } from './campaign-access-form-visibility'
import {
  CAMPAIGN_ACCESS_SECTION_LEGEND,
  CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT,
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

function visibilitySelectHint(): string {
  return !CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED
    ? CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT
    : CONTENT_VISIBILITY_SELECT_HINT
}

export function buildCampaignAccessFields(ctx: CampaignAccessFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: CAMPAIGN_ACCESS_SECTION_LEGEND,
      legendSize: 'subsection',
      rhythm: 'compact',
      // fieldsChrome: { variant: 'outline' },
      // fieldsChrome: { variant: 'panel', tone: 'strong' },
      fields: [
        {
          kind: 'row',
          fields: [
            {
              kind: 'slot',
              name: 'available',
              chrome: { variant: 'outline' },
              className: 'min-w-0 flex-1',
              render: () => createElement(CampaignAccessAvailableSwitch),
            },
            {
              type: 'select',
              name: 'visibilityMode',
              label: CONTENT_VISIBILITY_MODE_TERM.label,
              labelPosition: 'settings',
              hint: visibilitySelectHint(),
              width: '1/2',
              size: 'sm',
              chrome: { variant: 'outline' },
              disabled: !ctx.available || ctx.pending,
              options: buildVisibilityModeOptions(ctx.targetType),
              optionAvailability: campaignAccessVisibilityOptionAvailability(),
            },
          ],
        },
      ],
    },
  ]
}
