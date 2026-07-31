import type { NotificationListQuery } from '@rpg/contracts'

export const notificationsQueryKey = ['notifications', 'list'] as const

export const NOTIFICATION_LIST_LIMIT = 10

export const notificationsListQueryKey = (limit: number) =>
  [...notificationsQueryKey, { limit }] as const

export type NotificationInboxQueryFilters = Partial<
  Pick<NotificationListQuery, 'unread' | 'category' | 'campaignId'>
>

/** Prefix for invalidating every inbox query regardless of active filters. */
export const notificationsInboxRootQueryKey = ['notifications', 'inbox'] as const

export const notificationsInboxQueryKey = (filters: NotificationInboxQueryFilters = {}) =>
  [...notificationsInboxRootQueryKey, filters] as const

export const NOTIFICATION_INBOX_PAGE_LIMIT = 20
