'use client'

import { Button } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { PageHeader } from '@/components/layout/page-header'

import { NotificationInboxBody } from '../components/notification-inbox-body.client'
import { NotificationInboxHeader } from '../components/notification-inbox-header.client'
import { useNotificationInboxPage } from '../hooks/use-notification-inbox-page'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

export function NotificationsList() {
  const {
    schema,
    filters,
    setFilterValue,
    resetFilters,
    clearFilterField,
    invalidScopeNotice,
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
      <PageHeader
        heading={NOTIFICATION_COPY.title}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            density="compact"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadPending}
          >
            {NOTIFICATION_COPY.markAllAsRead}
          </Button>
        }
      />
      <NotificationInboxHeader
        schema={schema}
        filters={filters}
        onFilterChange={setFilterValue}
        onClearFilterField={clearFilterField}
        onResetFilters={resetFilters}
        invalidScopeNotice={invalidScopeNotice}
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
