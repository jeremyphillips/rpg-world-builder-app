import type { NotificationCategory, NotificationListResponse } from '@rpg/contracts'

import { deliverNotificationRead } from '../../realtime'
import {
  countUnreadNotifications,
  listNotificationsForRecipient,
  markAllNotificationsRead as markAllNotificationsReadRecord,
  markNotificationRead as markNotificationReadRecord,
  markNotificationsSeen,
} from './notification.repository'

export async function listNotifications(
  recipientUserId: string,
  options: {
    limit: number
    cursor?: string
    unread?: boolean
    category?: NotificationCategory
    campaignId?: string
  },
): Promise<NotificationListResponse> {
  const [{ items, nextCursor }, unreadCount] = await Promise.all([
    listNotificationsForRecipient({
      recipientUserId,
      limit: options.limit,
      cursor: options.cursor,
      unread: options.unread,
      category: options.category,
      campaignId: options.campaignId,
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

export async function markNotificationRead(input: {
  recipientUserId: string
  notificationId: string
}) {
  const notification = await markNotificationReadRecord(input)
  if (!notification) return null

  const unreadCount = await countUnreadNotifications(input.recipientUserId)
  deliverNotificationRead({
    userId: input.recipientUserId,
    notification,
    unreadCount,
    version: notification.version,
  })

  return notification
}

export async function markAllNotificationsRead(recipientUserId: string) {
  const result = await markAllNotificationsReadRecord(recipientUserId)
  if (result.updatedCount === 0) return result

  deliverNotificationRead({
    userId: recipientUserId,
    notificationIds: result.notificationIds,
    unreadCount: 0,
    version: result.version,
  })

  return result
}

export { markNotificationsSeen }
