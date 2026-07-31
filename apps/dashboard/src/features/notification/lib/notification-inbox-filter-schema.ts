import type { Notification, NotificationCategory } from '@rpg/contracts'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_ENTRIES,
  getNotificationClassification,
} from '@rpg/contracts'
import { createBooleanFilter, createEqualsFilter, createFilterSchema } from '@rpg/ui/filters'

import {
  CAMPAIGN_SCOPE_FILTER_ID,
  createCampaignScopeFilterField,
  type CampaignScopeFilterOption,
} from '@/lib/filters'

export type NotificationInboxFilterState = {
  unread?: boolean
  campaignId?: string
  category?: NotificationCategory
}

export const NOTIFICATION_INBOX_TYPE_FILTER_ID = 'category' as const

export function createNotificationInboxFilterSchema(
  campaignOptions: readonly CampaignScopeFilterOption[],
) {
  const campaignField = createCampaignScopeFilterField<Notification, NotificationInboxFilterState>({
    options: campaignOptions,
    includeActiveChip: true,
  })

  const fields = [
    createBooleanFilter<Notification, NotificationInboxFilterState, 'unread'>({
      id: 'unread',
      label: 'Unread only',
      placement: 'primary',
      getValue: (row) => !row.readAt,
      matches: () => true,
      url: { key: 'unread' },
    }),
    ...(campaignField ? [campaignField] : []),
    createEqualsFilter<
      Notification,
      NotificationInboxFilterState,
      typeof NOTIFICATION_INBOX_TYPE_FILTER_ID,
      NotificationCategory
    >({
      id: NOTIFICATION_INBOX_TYPE_FILTER_ID,
      label: 'Type',
      placement: 'primary',
      layout: 'stacked',
      width: 'md',
      showAllOption: true,
      allOptionLabel: 'All notifications',
      options: NOTIFICATION_CATEGORIES.map((category) => ({
        value: category,
        label: NOTIFICATION_CATEGORY_ENTRIES[category].label,
      })),
      getValue: (row) => getNotificationClassification(row.type).category,
      matches: () => true,
    }),
  ] as const

  return createFilterSchema<Notification, NotificationInboxFilterState>(fields)
}

export function toNotificationListQueryFilters(filters: NotificationInboxFilterState) {
  return {
    unread: filters.unread === true ? true : undefined,
    category: filters.category,
    campaignId: filters.campaignId,
  }
}

export { CAMPAIGN_SCOPE_FILTER_ID }
