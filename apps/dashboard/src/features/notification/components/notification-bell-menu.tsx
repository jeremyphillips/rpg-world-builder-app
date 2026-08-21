import { NotificationBell, NotificationPopover, NotificationPopoverHeader } from '@rpg/ui'
import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { NOTIFICATION_COPY } from '../lib/notification-copy'
import { NotificationBellMenuBody } from './notification-bell-menu-body'
import { useNotificationBellMenu } from '../hooks/use-notification-bell-menu'

export function NotificationBellMenu() {
  const { campaignId: routeCampaignId } = useParams<{ campaignId?: string }>()
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
        title={NOTIFICATION_COPY.title}
        actionLabel={NOTIFICATION_COPY.markAllAsRead}
        onAction={handleMarkAllRead}
        actionDisabled={unreadCount === 0 || markAllReadPending}
      />
      <NotificationBellMenuBody
        isLoading={isLoading}
        isError={isError}
        itemCount={items.length}
        previewItems={previewItems}
        notificationsViewAllHref={ROUTES.notifications.list}
        campaignMessagesHref={
          routeCampaignId ? ROUTES.messages.listScoped(routeCampaignId) : undefined
        }
        onRetry={() => {
          void refetch()
        }}
      />
    </NotificationPopover>
  )
}
