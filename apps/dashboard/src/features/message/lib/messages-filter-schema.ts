import type { Notification } from '@rpg/contracts'
import { createFilterSchema } from '@rpg/ui/filters'

import {
  createCampaignScopeFilterField,
  type CampaignScopeFilterOption,
  type CampaignScopeFilterState,
} from '@/lib/filters'

export type MessagesFilterState = CampaignScopeFilterState

export function createMessagesFilterSchema(campaignOptions: readonly CampaignScopeFilterOption[]) {
  const campaignField = createCampaignScopeFilterField<Notification, MessagesFilterState>({
    options: campaignOptions,
    includeActiveChip: false,
  })

  if (!campaignField) {
    return createFilterSchema<Notification, MessagesFilterState>([])
  }

  return createFilterSchema<Notification, MessagesFilterState>([campaignField])
}
