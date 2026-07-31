import { createFilterSchema } from '@rpg/ui/filters'

import {
  createCampaignScopeFilterField,
  type CampaignScopeFilterOption,
  type CampaignScopeFilterState,
} from '@/lib/filters'

export type MessagesFilterState = CampaignScopeFilterState

export function createMessagesFilterSchema(campaignOptions: readonly CampaignScopeFilterOption[]) {
  const campaignField = createCampaignScopeFilterField<unknown, MessagesFilterState>({
    options: campaignOptions,
    includeActiveChip: false,
  })

  if (!campaignField) {
    return createFilterSchema<unknown, MessagesFilterState>([])
  }

  return createFilterSchema<unknown, MessagesFilterState>([campaignField])
}
