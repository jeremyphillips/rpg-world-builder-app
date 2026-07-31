'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import type { Notification } from '@rpg/contracts'

import { listUnseenNotificationIds } from '../lib/unseen-notification-ids'
import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'
import { resolveNotificationActionPath } from '../lib/resolve-notification-action'
import { useNotificationActions } from './use-notification-actions'
import { useNotifications } from './use-notifications'

export function useNotificationBellMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const markedSeenForOpenRef = React.useRef(false)
  const { data, isLoading, isError, refetch } = useNotifications()
  const { markRead, markAllRead, markSeen } = useNotificationActions()
  const { mutate: markSeenMutate } = markSeen

  const items = data?.items ?? []
  const unreadCount = data?.unreadCount ?? 0

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      markedSeenForOpenRef.current = false
    }
    setOpen(nextOpen)
  }, [])

  React.useEffect(() => {
    if (!open || markedSeenForOpenRef.current) return

    const unseenIds = listUnseenNotificationIds(items)
    if (unseenIds.length === 0) return

    markedSeenForOpenRef.current = true
    markSeenMutate(unseenIds)
  }, [items, markSeenMutate, open])

  const handleActivate = React.useCallback(
    (notification: Notification) => {
      void markRead.mutateAsync(notification.id).catch(() => {
        void refetch()
      })

      const path = resolveNotificationActionPath(notification.action)
      if (!path) return

      setOpen(false)
      markedSeenForOpenRef.current = false
      navigate(path)
    },
    [markRead, navigate, refetch],
  )

  const handleMarkAllRead = React.useCallback(() => {
    void markAllRead.mutateAsync().catch(() => {
      void refetch()
    })
  }, [markAllRead, refetch])

  const previewItems = React.useMemo(
    () => mapNotificationsToPreviewItems(items, handleActivate),
    [handleActivate, items],
  )

  return {
    open,
    setOpen: handleOpenChange,
    unreadCount,
    isLoading,
    isError,
    items,
    previewItems,
    handleMarkAllRead,
    markAllReadPending: markAllRead.isPending,
  }
}
