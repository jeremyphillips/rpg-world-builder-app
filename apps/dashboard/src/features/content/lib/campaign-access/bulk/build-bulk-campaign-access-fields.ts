import type { ContentAccessTargetType } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  BULK_CAMPAIGN_ACCESS_AVAILABILITY_LABEL,
  BULK_CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
  CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
} from '../campaign-access-labels'
import {
  buildCampaignAccessAvailabilityOptions,
  buildCampaignAccessVisibilityOptions,
} from '../campaign-access-options.lib'

export type BulkCampaignAccessFormFieldValues = {
  availableOption: string
  visibilityModeOption: string
}

export const BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS: BulkCampaignAccessFormFieldValues = {
  availableOption: 'unchanged',
  visibilityModeOption: 'unchanged',
}

export function buildBulkCampaignAccessFields(targetType: ContentAccessTargetType): FormItem[] {
  return [
    {
      type: 'select',
      name: 'availableOption',
      label: BULK_CAMPAIGN_ACCESS_AVAILABILITY_LABEL,
      info: CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
      width: 'full',
      size: 'sm',
      options: buildCampaignAccessAvailabilityOptions({ includeLeaveUnchanged: true }),
    },
    {
      type: 'select',
      name: 'visibilityModeOption',
      label: BULK_CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
      info: CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
      width: 'full',
      size: 'sm',
      options: buildCampaignAccessVisibilityOptions(targetType, {
        includeLeaveUnchanged: true,
        includeSpecificPlayers: false,
      }),
    },
  ]
}
