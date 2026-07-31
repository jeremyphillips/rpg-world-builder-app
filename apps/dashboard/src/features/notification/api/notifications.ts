import type {
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  MarkNotificationsSeenResponse,
  NotificationListQuery,
  NotificationListResponse,
} from '@rpg/contracts'

import { patchJson, postJson, request } from '@/lib/api-client'

const NOTIFICATIONS_API_PATH = '/api/notifications'

export async function listNotifications(
  options: Partial<
    Pick<NotificationListQuery, 'limit' | 'cursor' | 'unread' | 'category' | 'campaignId'>
  > = {},
): Promise<NotificationListResponse> {
  const params = new URLSearchParams()
  if (options.limit) params.set('limit', String(options.limit))
  if (options.cursor) params.set('cursor', options.cursor)
  if (options.unread === true) params.set('unread', 'true')
  if (options.category) params.set('category', options.category)
  if (options.campaignId) params.set('campaignId', options.campaignId)

  const query = params.toString()
  const path = query ? `${NOTIFICATIONS_API_PATH}?${query}` : NOTIFICATIONS_API_PATH

  return request<NotificationListResponse>(path, undefined, 'Could not load notifications.')
}

export async function markNotificationRead(
  notificationId: string,
): Promise<MarkNotificationReadResponse> {
  return patchJson<MarkNotificationReadResponse>(
    `${NOTIFICATIONS_API_PATH}/${notificationId}/read`,
    undefined,
    'Could not mark notification as read.',
  )
}

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResponse> {
  return postJson<MarkAllNotificationsReadResponse>(
    `${NOTIFICATIONS_API_PATH}/mark-all-read`,
    undefined,
    'Could not mark all notifications as read.',
  )
}

export async function markNotificationsSeen(ids: string[]): Promise<MarkNotificationsSeenResponse> {
  return postJson<MarkNotificationsSeenResponse>(
    `${NOTIFICATIONS_API_PATH}/mark-seen`,
    { ids },
    'Could not update notification seen state.',
  )
}
