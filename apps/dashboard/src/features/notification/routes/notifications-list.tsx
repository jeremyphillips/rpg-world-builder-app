'use client'

import { Button } from '@rpg/ui'

import { IndexPageIntro } from '@/components/layout/index-page-intro'
import { NarrowPage } from '@/components/layout/narrow-page'

import { NotificationInboxBody } from '../components/notification-inbox-body.client'
import { useNotificationInboxPage } from '../hooks/use-notification-inbox-page'

export function NotificationsList() {
  const {
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
  } = useNotificationInboxPage()

  return (
    <NarrowPage spacing="relaxed">
      <IndexPageIntro
        title="Notifications"
        description="Your notification history beyond the latest bell preview."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadPending}
          >
            Mark all as read
          </Button>
        }
        showActionsInHeader={itemCount > 0}
      />

      <NotificationInboxBody
        isPending={isPending}
        isError={isError}
        itemCount={itemCount}
        previewItems={previewItems}
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
