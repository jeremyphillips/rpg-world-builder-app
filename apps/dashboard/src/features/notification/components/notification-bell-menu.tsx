'use client'

import { NotificationBell, NotificationPopover, NotificationPopoverHeader } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useActiveCampaignId } from '@/features/campaign'

import { NotificationBellMenuBody } from './notification-bell-menu-body'
import { useNotificationBellMenu } from '../hooks/use-notification-bell-menu'

export function NotificationBellMenu() {
  const activeCampaignId = useActiveCampaignId()
  const {
    open,
    setOpen,
    unreadCount,
    isLoading,
    isError,
    items,
    previewItems,
    handleMarkAllRead,
    markAllReadPending,
    refetch,
  } = useNotificationBellMenu()

  return (
    <NotificationPopover
      open={open}
      onOpenChange={setOpen}
      trigger={<NotificationBell unreadCount={unreadCount} />}
    >
      <NotificationPopoverHeader
        title="Notifications"
        actionLabel="Mark all as read"
        onAction={handleMarkAllRead}
        actionDisabled={unreadCount === 0 || markAllReadPending}
      />
      <NotificationBellMenuBody
        isLoading={isLoading}
        isError={isError}
        itemCount={items.length}
        previewItems={previewItems}
        notificationsViewAllHref={ROUTES.notifications.list}
        messagesFooter={{
          viewForCampaignHref: activeCampaignId
            ? ROUTES.messages.listScoped(activeCampaignId)
            : undefined,
          viewAllMessagesHref: ROUTES.messages.list,
        }}
        onRetry={() => {
          void refetch()
        }}
      />
    </NotificationPopover>
  )
}
