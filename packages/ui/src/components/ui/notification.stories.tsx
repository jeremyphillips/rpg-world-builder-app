import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button.client'
import { NotificationBell } from './notification-bell.client'
import { NotificationEmptyState } from './notification-empty-state'
import { NotificationLoadingState } from './notification-loading-state'
import { NotificationPopover, NotificationPopoverHeader } from './notification-popover.client'
import { NotificationPreviewList } from './notification-preview-list.client'
import { NotificationUnreadBadge } from './notification-unread-badge'

const meta = {
  title: 'Components/Notification',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Bell: Story = {
  render: () => <NotificationBell unreadCount={3} />,
}

export const UnreadBadge: Story = {
  render: () => (
    <div className="relative inline-flex size-10 items-center justify-center rounded-md border border-border">
      <NotificationUnreadBadge count={12} />
    </div>
  ),
}

export const Popover: Story = {
  render: () => (
    <NotificationPopover
      trigger={<Button type="button">Open notifications</Button>}
      open
      onOpenChange={() => undefined}
    >
      <NotificationPopoverHeader
        title="Notifications"
        actionLabel="Mark all as read"
        onAction={() => undefined}
      />
      <NotificationPreviewList
        items={[
          {
            id: '1',
            title: 'Invitation accepted',
            description: 'Ava accepted your invitation to Stormwatch.',
            timestamp: '2m ago',
            unread: true,
            onActivate: () => undefined,
          },
          {
            id: '2',
            title: 'Campaign invitation',
            description: 'Open the invite email to accept.',
            timestamp: '1h ago',
            unread: false,
          },
        ]}
      />
    </NotificationPopover>
  ),
}

export const Empty: Story = {
  render: () => <NotificationEmptyState />,
}

export const Loading: Story = {
  render: () => <NotificationLoadingState />,
}
