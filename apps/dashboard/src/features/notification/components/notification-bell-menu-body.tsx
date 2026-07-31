'use client'

import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
  NotificationPreviewList,
} from '@rpg/ui'

import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'

type NotificationBellMenuBodyProps = {
  isLoading: boolean
  isError: boolean
  itemCount: number
  previewItems: ReturnType<typeof mapNotificationsToPreviewItems>
  onRetry?: () => void
}

export function NotificationBellMenuBody({
  isLoading,
  isError,
  itemCount,
  previewItems,
  onRetry,
}: NotificationBellMenuBodyProps) {
  if (isLoading) return <NotificationLoadingState />
  if (isError) return <NotificationErrorState onRetry={onRetry} />
  if (itemCount === 0) return <NotificationEmptyState />
  return <NotificationPreviewList items={previewItems} />
}
