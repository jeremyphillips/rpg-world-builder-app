'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@rpg/ui'
import type { Notification } from '@rpg/contracts'

import { activateNotification } from '../lib/activate-notification'
import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items.client'
import { NOTIFICATION_COPY } from '../lib/notification-copy'
import { useNotificationActions } from './use-notification-actions'
import { useNotificationInbox } from './use-notification-inbox'

const NOTIFICATION_ACTION_FAILED_MESSAGE = 'Could not update notification.'

export type NotificationInboxFilter = 'all' | 'unread'

export function useNotificationInboxPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = React.useState<NotificationInboxFilter>('all')
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

  const filteredItems = React.useMemo(() => {
    if (filter === 'unread') {
      return items.filter((item) => !item.readAt)
    }
    return items
  }, [filter, items])

  const handleActivate = React.useCallback(
    (notification: Notification) => {
      activateNotification({
        notification,
        markRead,
        navigate,
        onFailure: () => {
          toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
          void refetch()
        },
      })
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
    () => mapNotificationsToPreviewItems(filteredItems, handleActivate),
    [filteredItems, handleActivate],
  )

  const handleLoadMore = React.useCallback(() => {
    void fetchNextPage().catch(() => {
      toast.error('Could not load more notifications.')
    })
  }, [fetchNextPage])

  return {
    filter,
    setFilter,
    isPending,
    isError,
    refetch,
    previewItems,
    itemCount: filteredItems.length,
    totalItemCount: items.length,
    unreadCount,
    handleMarkAllRead,
    markAllReadPending: markAllRead.isPending,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isFetchNextPageError,
    handleLoadMore,
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
  }
}
