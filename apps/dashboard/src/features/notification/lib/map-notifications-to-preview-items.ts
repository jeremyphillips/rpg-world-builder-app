import type { Notification } from '@rpg/contracts'
import type { NotificationPreviewListItem } from '@rpg/ui'

import { formatRelativeOrDate } from '@/lib/datetime/format-datetime'

import { resolveNotificationActionPath } from './resolve-notification-action'

function isUnread(notification: Notification): boolean {
  return !notification.readAt
}

export function mapNotificationsToPreviewItems(
  items: readonly Notification[],
  onActivate: (notification: Notification) => void,
): NotificationPreviewListItem[] {
  return items.map((notification) => {
    const path = resolveNotificationActionPath(notification.action)

    return {
      id: notification.id,
      title: notification.title,
      description: notification.description,
      timestamp: formatRelativeOrDate(notification.createdAt),
      unread: isUnread(notification),
      actionLabel: path ? 'Open' : undefined,
      onActivate: () => onActivate(notification),
    }
  })
}
