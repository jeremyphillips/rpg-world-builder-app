import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NotificationListResponse } from '@rpg/contracts'

import {
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsSeen,
} from '../api/notifications'
import { notificationsListQueryKey } from '../lib/notification-query-keys'
import { NOTIFICATION_LIST_LIMIT } from './use-notifications'

function updateListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (current: NotificationListResponse) => NotificationListResponse,
): void {
  queryClient.setQueryData(
    notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
    (current: NotificationListResponse | undefined) => {
      if (!current) return current
      return updater(current)
    },
  )
}

export function useNotificationActions() {
  const queryClient = useQueryClient()

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: ({ notification }) => {
      updateListCache(queryClient, (current) => {
        const previous = current.items.find((item) => item.id === notification.id)
        const wasUnread = Boolean(previous && !previous.readAt && notification.readAt)

        return {
          ...current,
          unreadCount: wasUnread ? Math.max(0, current.unreadCount - 1) : current.unreadCount,
          items: current.items.map((item) => (item.id === notification.id ? notification : item)),
        }
      })
    },
  })

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      updateListCache(queryClient, (current) => ({
        ...current,
        unreadCount: 0,
        items: current.items.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
          seenAt: item.seenAt ?? new Date().toISOString(),
        })),
      }))
    },
  })

  const markSeen = useMutation({
    mutationFn: markNotificationsSeen,
    onSuccess: (_result, ids) => {
      const seenAt = new Date().toISOString()
      updateListCache(queryClient, (current) => ({
        ...current,
        items: current.items.map((item) => (ids.includes(item.id) ? { ...item, seenAt } : item)),
      }))
    },
  })

  return {
    markRead,
    markAllRead,
    markSeen,
  }
}
