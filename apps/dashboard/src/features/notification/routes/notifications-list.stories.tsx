import type { Meta, StoryObj } from '@storybook/react-vite'
import { NotificationPopoverHeader, SegmentedControl, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'

import { NotificationInboxBody } from '../components/notification-inbox-body.client'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

const previewItems = [
  {
    id: 'notification-1',
    title: 'New message',
    description: 'Bobby V: blah',
    timestamp: '1 hour ago',
    unread: true,
    onActivate: () => undefined,
  },
  {
    id: 'notification-2',
    title: 'Invitation accepted',
    description: 'Blake accepted your invitation to Harbor.',
    timestamp: '2 hours ago',
    unread: false,
    onActivate: () => undefined,
  },
] as const

function NotificationsListPagePreview() {
  return (
    <NarrowPage spacing="compact">
      <div className="space-y-3 border-b border-border pb-4">
        <NotificationPopoverHeader
          title={NOTIFICATION_COPY.title}
          actionLabel={NOTIFICATION_COPY.markAllAsRead}
          onAction={() => undefined}
        />
        <Text as="p" variant="muted" className="px-3 text-sm">
          {NOTIFICATION_COPY.inboxDescription}
        </Text>
        <div className="px-3">
          <SegmentedControl
            value="all"
            onValueChange={() => undefined}
            options={[
              { value: 'all', label: NOTIFICATION_COPY.filterAll },
              { value: 'unread', label: NOTIFICATION_COPY.filterUnread },
            ]}
            fullWidth
          />
        </div>
      </div>
      <NotificationInboxBody
        isPending={false}
        isError={false}
        itemCount={previewItems.length}
        previewItems={[...previewItems]}
        emptyTitle={NOTIFICATION_COPY.caughtUpTitle}
        hasNextPage
        isFetchingNextPage={false}
        isFetchNextPageError={false}
        onLoadMore={() => undefined}
      />
    </NarrowPage>
  )
}

const meta = {
  title: 'Notification/NotificationsList',
  component: NotificationsListPagePreview,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotificationsListPagePreview>

export default meta

type Story = StoryObj<typeof NotificationsListPagePreview>

export const Default: Story = {}
