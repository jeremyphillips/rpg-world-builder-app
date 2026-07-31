'use client'

import { Link } from 'react-router-dom'
import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
  NotificationPreviewList,
  buttonVariants,
} from '@rpg/ui'

import { MESSAGES_ACTION_COPY } from '@/features/message'

import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items'

type NotificationBellMessagesFooterProps = {
  viewForCampaignHref?: string
  viewAllMessagesHref: string
}

function NotificationBellMessagesFooter({
  viewForCampaignHref,
  viewAllMessagesHref,
}: NotificationBellMessagesFooterProps) {
  const linkClassName = `${buttonVariants({ variant: 'ghost', size: 'sm' })} w-full justify-start`

  return (
    <div className="flex flex-col gap-1">
      {viewForCampaignHref ? (
        <Link to={viewForCampaignHref} className={linkClassName}>
          {MESSAGES_ACTION_COPY.viewForCampaign}
        </Link>
      ) : null}
      <Link to={viewAllMessagesHref} className={linkClassName}>
        {MESSAGES_ACTION_COPY.viewAll}
      </Link>
    </div>
  )
}

type NotificationBellMenuFooterProps = {
  itemCount: number
  notificationsViewAllHref?: string
  messagesFooter?: NotificationBellMessagesFooterProps
}

function NotificationBellMenuFooter({
  itemCount,
  notificationsViewAllHref,
  messagesFooter,
}: NotificationBellMenuFooterProps) {
  if (!messagesFooter && !(notificationsViewAllHref && itemCount > 0)) {
    return null
  }

  const linkClassName = `${buttonVariants({ variant: 'ghost', size: 'sm' })} w-full justify-start`

  return (
    <div className="space-y-2 border-t border-border p-2">
      {messagesFooter ? <NotificationBellMessagesFooter {...messagesFooter} /> : null}
      {notificationsViewAllHref && itemCount > 0 ? (
        <Link to={notificationsViewAllHref} className={linkClassName}>
          View all
        </Link>
      ) : null}
    </div>
  )
}

type NotificationBellMenuBodyProps = {
  isLoading: boolean
  isError: boolean
  itemCount: number
  previewItems: ReturnType<typeof mapNotificationsToPreviewItems>
  notificationsViewAllHref?: string
  messagesFooter?: NotificationBellMessagesFooterProps
  onRetry?: () => void
}

export function NotificationBellMenuBody({
  isLoading,
  isError,
  itemCount,
  previewItems,
  notificationsViewAllHref,
  messagesFooter,
  onRetry,
}: NotificationBellMenuBodyProps) {
  const footer = (
    <NotificationBellMenuFooter
      itemCount={itemCount}
      notificationsViewAllHref={notificationsViewAllHref}
      messagesFooter={messagesFooter}
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
        <NotificationEmptyState />
        {footer}
      </>
    )
  }

  return <NotificationPreviewList items={previewItems} footerSlot={footer} />
}
