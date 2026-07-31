'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@rpg/ui'
import type { Notification } from '@rpg/contracts'

import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'
import { resolveNotificationActionPath } from '../lib/resolve-notification-action'
import { useNotificationActions } from './use-notification-actions'
import { useNotificationInbox } from './use-notification-inbox'

const NOTIFICATION_ACTION_FAILED_MESSAGE = 'Could not update notification.'

export function useNotificationInboxPage() {
  const navigate = useNavigate()
  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useNotificationInbox()
  const { markRead, markAllRead } = useNotificationActions()

  const items = React.useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.items) : []),
    [data?.pages],
  )
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const handleActivate = React.useCallback(
    (notification: Notification) => {
      void markRead.mutateAsync(notification.id).catch(() => {
        toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
        void refetch()
      })

      const path = resolveNotificationActionPath(notification.action)
      if (!path) return

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

  const handleLoadMore = React.useCallback(() => {
    void fetchNextPage().catch(() => {
      toast.error('Could not load more notifications.')
    })
  }, [fetchNextPage])

  return {
    isPending,
    isError,
    refetch,
    previewItems,
    itemCount: items.length,
    unreadCount,
    handleMarkAllRead,
    markAllReadPending: markAllRead.isPending,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isFetchNextPageError,
    handleLoadMore,
  }
}
