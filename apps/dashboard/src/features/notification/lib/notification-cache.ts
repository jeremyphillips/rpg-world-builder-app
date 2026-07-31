import type {
  Notification,
  NotificationListResponse,
  NotificationReadPayload,
  NotificationUpsertedPayload,
} from '@rpg/contracts'

import { NOTIFICATION_LIST_LIMIT } from './notification-query-keys'

export type { NotificationReadPayload, NotificationUpsertedPayload }

function compareNotificationsNewestFirst(left: Notification, right: Notification): number {
  const createdAtCompare = right.createdAt.localeCompare(left.createdAt)
  if (createdAtCompare !== 0) return createdAtCompare
  return right.id.localeCompare(left.id)
}

function shouldApplyNotificationVersion(
  cached: Notification | undefined,
  incomingVersion: number,
): boolean {
  if (!cached) return true
  return incomingVersion >= cached.version
}

function applySingleNotificationRead(
  current: NotificationListResponse,
  notification: Notification,
  unreadCount?: number,
): NotificationListResponse {
  const previous = current.items.find((item) => item.id === notification.id)
  const wasUnread = Boolean(previous && !previous.readAt && notification.readAt)

  return {
    ...current,
    unreadCount:
      unreadCount ?? (wasUnread ? Math.max(0, current.unreadCount - 1) : current.unreadCount),
    items: current.items.map((item) => (item.id === notification.id ? notification : item)),
  }
}

/** Applies a socket or HTTP mark-all-read payload to the bell list cache. */
export function applyNotificationMarkAllRead(
  current: NotificationListResponse | undefined,
  input: { unreadCount: number },
): NotificationListResponse | undefined {
  if (!current) return current

  const now = new Date().toISOString()
  return {
    ...current,
    unreadCount: input.unreadCount,
    items: current.items.map((item) => ({
      ...item,
      readAt: item.readAt ?? now,
      seenAt: item.seenAt ?? now,
    })),
  }
}

/** Applies an HTTP mark-read mutation result to the bell list cache. */
export function applyNotificationMarkedRead(
  current: NotificationListResponse | undefined,
  notification: Notification,
): NotificationListResponse | undefined {
  if (!current) return current
  return applySingleNotificationRead(current, notification)
}

/** Applies a realtime `notification.read` payload with version guards. */
export function applyNotificationRead(
  current: NotificationListResponse | undefined,
  payload: NotificationReadPayload,
): NotificationListResponse | undefined {
  if (!current) {
    if ('notificationIds' in payload) {
      return { items: [], unreadCount: payload.unreadCount, nextCursor: null }
    }

    return {
      items: [payload.notification],
      unreadCount: payload.unreadCount,
      nextCursor: null,
    }
  }

  if ('notificationIds' in payload) {
    return applyNotificationMarkAllRead(current, { unreadCount: payload.unreadCount })
  }

  const existing = current.items.find((item) => item.id === payload.notification.id)
  if (!shouldApplyNotificationVersion(existing, payload.notification.version)) {
    return current
  }

  return applySingleNotificationRead(current, payload.notification, payload.unreadCount)
}

/** Applies a realtime `notification.upserted` payload with version guards. */
export function applyNotificationUpserted(
  current: NotificationListResponse | undefined,
  payload: NotificationUpsertedPayload,
  limit = NOTIFICATION_LIST_LIMIT,
): NotificationListResponse | undefined {
  if (!current) {
    return {
      items: [payload.notification].slice(0, limit),
      unreadCount: payload.unreadCount,
      nextCursor: null,
    }
  }

  const existing = current.items.find((item) => item.id === payload.notification.id)
  if (!shouldApplyNotificationVersion(existing, payload.version)) {
    return current
  }

  const withoutExisting = current.items.filter((item) => item.id !== payload.notification.id)
  const items = [payload.notification, ...withoutExisting]
    .sort(compareNotificationsNewestFirst)
    .slice(0, limit)

  return {
    ...current,
    items,
    unreadCount: payload.unreadCount,
  }
}
