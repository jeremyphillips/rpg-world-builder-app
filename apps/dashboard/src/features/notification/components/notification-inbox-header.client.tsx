'use client'

import { NotificationPopoverHeader, SegmentedControl, Text } from '@rpg/ui'

import { NOTIFICATION_COPY } from '../lib/notification-copy'
import type { NotificationInboxFilter } from '../hooks/use-notification-inbox-page'

type NotificationInboxHeaderProps = {
  unreadCount: number
  filter: NotificationInboxFilter
  onFilterChange: (filter: NotificationInboxFilter) => void
  onMarkAllRead: () => void
  markAllReadPending: boolean
}

export function NotificationInboxHeader({
  unreadCount,
  filter,
  onFilterChange,
  onMarkAllRead,
  markAllReadPending,
}: NotificationInboxHeaderProps) {
  return (
    <div className="space-y-3 border-b border-border pb-4">
      <NotificationPopoverHeader
        title={NOTIFICATION_COPY.title}
        actionLabel={NOTIFICATION_COPY.markAllAsRead}
        onAction={onMarkAllRead}
        actionDisabled={unreadCount === 0 || markAllReadPending}
      />
      <Text as="p" variant="muted" className="px-3 text-sm">
        {NOTIFICATION_COPY.inboxDescription}
      </Text>
      <div className="px-3">
        <SegmentedControl
          value={filter}
          onValueChange={onFilterChange}
          options={[
            { value: 'all', label: NOTIFICATION_COPY.filterAll },
            { value: 'unread', label: NOTIFICATION_COPY.filterUnread },
          ]}
          fullWidth
        />
      </div>
    </div>
  )
}
