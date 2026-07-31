'use client'

import {
  Button,
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
  NotificationPreviewList,
} from '@rpg/ui'

import type { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items.client'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

type NotificationInboxBodyProps = {
  isPending: boolean
  isError: boolean
  itemCount: number
  previewItems: ReturnType<typeof mapNotificationsToPreviewItems>
  emptyTitle: string
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  onRetry?: () => void
  onLoadMore: () => void
}

export function NotificationInboxBody({
  isPending,
  isError,
  itemCount,
  previewItems,
  emptyTitle,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onRetry,
  onLoadMore,
}: NotificationInboxBodyProps) {
  if (isPending) return <NotificationLoadingState />
  if (isError) return <NotificationErrorState onRetry={onRetry} />
  if (itemCount === 0) {
    return <NotificationEmptyState title={emptyTitle} description="" />
  }

  return (
    <div className="space-y-3">
      <NotificationPreviewList
        items={previewItems}
        className="max-h-none overflow-visible border-y border-border"
      />
      {hasNextPage ? (
        <Button type="button" variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? NOTIFICATION_COPY.loadingMore : NOTIFICATION_COPY.loadMore}
        </Button>
      ) : null}
      {isFetchNextPageError ? <NotificationErrorState onRetry={onLoadMore} /> : null}
    </div>
  )
}
