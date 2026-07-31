import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NotificationListResponse } from '@rpg/contracts'

import {
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsSeen,
} from '../api/notifications'
import {
  applyNotificationMarkAllRead,
  applyNotificationMarkedRead,
} from '../lib/notification-cache'
import {
  NOTIFICATION_LIST_LIMIT,
  notificationsInboxQueryKey,
  notificationsListQueryKey,
} from '../lib/notification-query-keys'

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

function invalidateInboxCache(queryClient: ReturnType<typeof useQueryClient>): void {
  if (queryClient.getQueryData(notificationsInboxQueryKey) === undefined) return
  void queryClient.invalidateQueries({ queryKey: notificationsInboxQueryKey })
}

export function useNotificationActions() {
  const queryClient = useQueryClient()

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: ({ notification }) => {
      updateListCache(queryClient, (current) => applyNotificationMarkedRead(current, notification)!)
      invalidateInboxCache(queryClient)
    },
  })

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      updateListCache(
        queryClient,
        (current) => applyNotificationMarkAllRead(current, { unreadCount: 0 })!,
      )
      invalidateInboxCache(queryClient)
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
