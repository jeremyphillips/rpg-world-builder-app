'use client'

import { NotificationBell, NotificationPopover, NotificationPopoverHeader } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { NotificationBellMenuBody } from './notification-bell-menu-body'
import { useNotificationBellMenu } from '../hooks/use-notification-bell-menu'

export function NotificationBellMenu() {
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
        viewAllHref={ROUTES.notifications.list}
        onRetry={() => {
          void refetch()
        }}
      />
    </NotificationPopover>
  )
}
