'use client'

import {
  NotificationEmptyState,
  NotificationLoadingState,
  NotificationPreviewList,
  Text,
} from '@rpg/ui'

import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'

type NotificationBellMenuBodyProps = {
  isLoading: boolean
  isError: boolean
  itemCount: number
  previewItems: ReturnType<typeof mapNotificationsToPreviewItems>
}

export function NotificationBellMenuBody({
  isLoading,
  isError,
  itemCount,
  previewItems,
}: NotificationBellMenuBodyProps) {
  if (isLoading) return <NotificationLoadingState />
  if (isError) {
    return (
      <div className="px-4 py-6 text-center">
        <Text as="p" variant="muted" className="text-sm">
          Could not load notifications.
        </Text>
      </div>
    )
  }
  if (itemCount === 0) return <NotificationEmptyState />
  return <NotificationPreviewList items={previewItems} />
}
