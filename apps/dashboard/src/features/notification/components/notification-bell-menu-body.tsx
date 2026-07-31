'use client'

import { Link } from 'react-router-dom'
import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationLoadingState,
  NotificationPreviewList,
  Text,
  buttonVariants,
} from '@rpg/ui'

import { MESSAGES_ACTION_COPY } from '@/features/message'

import type { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items.client'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

type NotificationBellCampaignMessagesSectionProps = {
  viewForCampaignHref: string
}

function NotificationBellCampaignMessagesSection({
  viewForCampaignHref,
}: NotificationBellCampaignMessagesSectionProps) {
  const linkClassName = `${buttonVariants({ variant: 'ghost', size: 'sm' })} w-full justify-start`

  return (
    <div className="space-y-1">
      <Text as="p" variant="caption" className="px-2 uppercase tracking-wide">
        {NOTIFICATION_COPY.messagesSectionHeading}
      </Text>
      <Link to={viewForCampaignHref} className={linkClassName}>
        {MESSAGES_ACTION_COPY.viewForCampaign}
      </Link>
    </div>
  )
}

type NotificationBellMenuFooterProps = {
  notificationsViewAllHref: string
  campaignMessagesHref?: string
}

function NotificationBellMenuFooter({
  notificationsViewAllHref,
  campaignMessagesHref,
}: NotificationBellMenuFooterProps) {
  const linkClassName = `${buttonVariants({ variant: 'ghost', size: 'sm' })} w-full justify-start`

  return (
    <div className="space-y-2 border-t border-border p-2">
      {campaignMessagesHref ? (
        <NotificationBellCampaignMessagesSection viewForCampaignHref={campaignMessagesHref} />
      ) : null}
      <Link to={notificationsViewAllHref} className={linkClassName}>
        {NOTIFICATION_COPY.viewAllNotifications}
      </Link>
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
