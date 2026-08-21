import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
  NotificationPreviewList,
  cn,
  notificationMenuFooterLinkVariants,
  notificationMenuRowLinkVariants,
} from '@rpg/ui'

import { MESSAGES_ACTION_COPY } from '@/features/message'

import type { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

type NotificationBellMenuFooterProps = {
  notificationsViewAllHref: string
  campaignMessagesHref?: string
}

function NotificationBellMenuFooter({
  notificationsViewAllHref,
  campaignMessagesHref,
}: NotificationBellMenuFooterProps) {
  return (
    <div>
      {campaignMessagesHref ? (
        <div className="p-1">
          <Link to={campaignMessagesHref} className={notificationMenuRowLinkVariants()}>
            <MessageSquare aria-hidden />
            {MESSAGES_ACTION_COPY.viewForCampaign}
          </Link>
        </div>
      ) : null}
      <div className="border-t border-border bg-muted p-1">
        <Link
          to={notificationsViewAllHref}
          className={cn(notificationMenuFooterLinkVariants({ emphasis: 'strong' }))}
        >
          {NOTIFICATION_COPY.viewAllNotifications}
        </Link>
      </div>
    </div>
  )
}

type NotificationBellMenuBodyProps = {
  isLoading: boolean
  isError: boolean
  itemCount: number
  previewItems: ReturnType<typeof mapNotificationsToPreviewItems>
  notificationsViewAllHref: string
  campaignMessagesHref?: string
  onRetry?: () => void
}

export function NotificationBellMenuBody({
  isLoading,
  isError,
  itemCount,
  previewItems,
  notificationsViewAllHref,
  campaignMessagesHref,
  onRetry,
}: NotificationBellMenuBodyProps) {
  const footer = (
    <NotificationBellMenuFooter
      notificationsViewAllHref={notificationsViewAllHref}
      campaignMessagesHref={campaignMessagesHref}
    />
  )

  if (isLoading) return <NotificationLoadingState />
  if (isError) {
    return (
      <>
        <NotificationErrorState onRetry={onRetry} />
        {footer}
      </>
    )
  }
  if (itemCount === 0) {
    return (
      <>
        <NotificationEmptyState title={NOTIFICATION_COPY.caughtUpTitle} description="" />
        {footer}
      </>
    )
  }

  return <NotificationPreviewList items={previewItems} footerSlot={footer} />
}
