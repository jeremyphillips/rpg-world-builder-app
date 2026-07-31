'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { toast } from '@rpg/ui'
import type { Notification } from '@rpg/contracts'

import { listUnseenNotificationIds } from '../lib/unseen-notification-ids'
import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'
import { resolveNotificationActionPath } from '../lib/resolve-notification-action'
import { useNotificationActions } from './use-notification-actions'
import { useNotifications } from './use-notifications'

const NOTIFICATION_ACTION_FAILED_MESSAGE = 'Could not update notification.'

export function useNotificationBellMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const markSeenInFlightRef = React.useRef(false)
  const markedSeenIdsRef = React.useRef(new Set<string>())
  const { data, isLoading, isError, refetch } = useNotifications()
  const { markRead, markAllRead, markSeen } = useNotificationActions()
  const { mutate: markSeenMutate } = markSeen

  const items = data?.items ?? []
  const unreadCount = data?.unreadCount ?? 0

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      markedSeenIdsRef.current.clear()
      markSeenInFlightRef.current = false
    }
    setOpen(nextOpen)
  }, [])

  React.useEffect(() => {
    if (!open || markSeenInFlightRef.current) return

    const unseenIds = listUnseenNotificationIds(items).filter(
      (id) => !markedSeenIdsRef.current.has(id),
    )
    if (unseenIds.length === 0) return

    markSeenInFlightRef.current = true
    markSeenMutate(unseenIds, {
      onSuccess: () => {
        for (const id of unseenIds) {
          markedSeenIdsRef.current.add(id)
        }
        markSeenInFlightRef.current = false
      },
      onError: () => {
        markSeenInFlightRef.current = false
        toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
      },
    })
  }, [items, markSeenMutate, open])

  const handleActivate = React.useCallback(
    (notification: Notification) => {
      void markRead.mutateAsync(notification.id).catch(() => {
        toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
        void refetch()
      })

      const path = resolveNotificationActionPath(notification.action)
      if (!path) return

      setOpen(false)
      markedSeenIdsRef.current.clear()
      markSeenInFlightRef.current = false
      navigate(path)
    },
    [markRead, navigate, refetch],
  )

  const handleMarkAllRead = React.useCallback(() => {
    void markAllRead.mutateAsync().catch(() => {
      toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
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
    refetch,
  }
}
