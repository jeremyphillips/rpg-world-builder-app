'use client'

import { NarrowPage } from '@/components/layout/narrow-page'

import { NotificationInboxBody } from '../components/notification-inbox-body.client'
import { NotificationInboxHeader } from '../components/notification-inbox-header.client'
import { useNotificationInboxPage } from '../hooks/use-notification-inbox-page'

export function NotificationsList() {
  const {
    filter,
    setFilter,
    isPending,
    isError,
    refetch,
    previewItems,
    itemCount,
    unreadCount,
    handleMarkAllRead,
    markAllReadPending,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    handleLoadMore,
    emptyTitle,
  } = useNotificationInboxPage()

  return (
    <NarrowPage spacing="compact">
      <NotificationInboxHeader
        unreadCount={unreadCount}
        filter={filter}
        onFilterChange={setFilter}
        onMarkAllRead={handleMarkAllRead}
        markAllReadPending={markAllReadPending}
      />

      <NotificationInboxBody
        isPending={isPending}
        isError={isError}
        itemCount={itemCount}
        previewItems={previewItems}
        emptyTitle={emptyTitle}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        onRetry={() => {
          void refetch()
        }}
        onLoadMore={handleLoadMore}
      />
    </NarrowPage>
  )
}
