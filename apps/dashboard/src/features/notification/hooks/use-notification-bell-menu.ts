'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import type { Notification } from '@rpg/contracts'

import { useNotificationActions } from './use-notification-actions'
import { useNotifications } from './use-notifications'
import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'
import { resolveNotificationActionPath } from '../lib/resolve-notification-action'

export function useNotificationBellMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const { data, isLoading, isError, refetch } = useNotifications()
  const { markRead, markAllRead, markSeen } = useNotificationActions()

  const items = data?.items ?? []
  const unreadCount = data?.unreadCount ?? 0
  const renderedIds = React.useMemo(() => items.map((item) => item.id), [items])

  React.useEffect(() => {
    if (!open || renderedIds.length === 0) return
    markSeen.mutate(renderedIds)
  }, [open, renderedIds, markSeen])

  const handleActivate = React.useCallback(
    (notification: Notification) => {
      void markRead.mutateAsync(notification.id).catch(() => {
        void refetch()
      })

      const path = resolveNotificationActionPath(notification.action)
      if (!path) return

      setOpen(false)
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
    setOpen,
    unreadCount,
    isLoading,
    isError,
    items,
    previewItems,
    handleMarkAllRead,
    markAllReadPending: markAllRead.isPending,
  }
}
