'use client'

import {
  Button,
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
  NotificationPreviewList,
} from '@rpg/ui'

import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'

type NotificationInboxBodyProps = {
  isPending: boolean
  isError: boolean
  itemCount: number
  previewItems: ReturnType<typeof mapNotificationsToPreviewItems>
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
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onRetry,
  onLoadMore,
}: NotificationInboxBodyProps) {
  if (isPending) return <NotificationLoadingState />
  if (isError) return <NotificationErrorState onRetry={onRetry} />
  if (itemCount === 0) return <NotificationEmptyState />

  return (
    <div className="space-y-3">
      <NotificationPreviewList items={previewItems} className="max-h-none overflow-visible" />
      {hasNextPage ? (
        <Button type="button" variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading more…' : 'Load more'}
        </Button>
      ) : null}
      {isFetchNextPageError ? <NotificationErrorState onRetry={onLoadMore} /> : null}
    </div>
  )
}
