import type { NotificationListResponse } from '@rpg/contracts'

import {
  countUnreadNotifications,
  listNotificationsForRecipient,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsSeen,
} from './notification.repository'

export async function listNotifications(
  recipientUserId: string,
  options: { limit: number; cursor?: string },
): Promise<NotificationListResponse> {
  const [{ items, nextCursor }, unreadCount] = await Promise.all([
    listNotificationsForRecipient({
      recipientUserId,
      limit: options.limit,
      cursor: options.cursor,
    }),
    countUnreadNotifications(recipientUserId),
  ])

  return {
    items,
    nextCursor,
    unreadCount,
  }
}

export async function getUnreadNotificationCount(recipientUserId: string): Promise<number> {
  return countUnreadNotifications(recipientUserId)
}

export { markNotificationRead, markAllNotificationsRead, markNotificationsSeen }
