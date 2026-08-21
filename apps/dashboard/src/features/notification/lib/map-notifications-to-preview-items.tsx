import type { Notification } from '@rpg/contracts'
import type { NotificationPreviewListItem } from '@rpg/ui'

import { formatRelativeOrDate } from '@/lib/datetime/format-datetime'

import { resolveNotificationPreviewIcon } from './resolve-notification-preview-icon'

function isUnread(notification: Notification): boolean {
  return !notification.readAt
}

export function mapNotificationsToPreviewItems(
  items: readonly Notification[],
  onActivate: (notification: Notification) => void,
): NotificationPreviewListItem[] {
  return items.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.description,
    timestamp: formatRelativeOrDate(notification.createdAt),
    unread: isUnread(notification),
    icon: resolveNotificationPreviewIcon(notification.type),
    onActivate: () => onActivate(notification),
  }))
}
