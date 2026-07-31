'use client'

import { Link } from 'react-router-dom'
import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
  NotificationPreviewList,
  buttonVariants,
} from '@rpg/ui'

import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'

type NotificationBellMenuBodyProps = {
  isLoading: boolean
  isError: boolean
  itemCount: number
  previewItems: ReturnType<typeof mapNotificationsToPreviewItems>
  viewAllHref?: string
  onRetry?: () => void
}

export function NotificationBellMenuBody({
  isLoading,
  isError,
  itemCount,
  previewItems,
  viewAllHref,
  onRetry,
}: NotificationBellMenuBodyProps) {
  if (isLoading) return <NotificationLoadingState />
  if (isError) return <NotificationErrorState onRetry={onRetry} />
  if (itemCount === 0) return <NotificationEmptyState />
  return (
    <NotificationPreviewList
      items={previewItems}
      footerSlot={
        viewAllHref ? (
          <div className="border-t border-border p-2">
            <Link to={viewAllHref} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              View all
            </Link>
          </div>
        ) : undefined
      }
    />
  )
}
