import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@rpg/ui'

import { IndexPageIntro } from '@/components/layout/index-page-intro'
import { NarrowPage } from '@/components/layout/narrow-page'

import { NotificationInboxBody } from '../components/notification-inbox-body.client'

const previewItems = [
  {
    id: 'notification-1',
    title: 'Invitation accepted',
    description: 'Blake accepted your invitation to Harbor.',
    timestamp: '5 minutes ago',
    unread: false,
    actionLabel: 'Open',
    onActivate: () => undefined,
  },
  {
    id: 'notification-2',
    title: 'New message',
    description: 'Ava sent you a message.',
    timestamp: '1 hour ago',
    unread: true,
    actionLabel: 'Open',
    onActivate: () => undefined,
  },
] as const

function NotificationsListPagePreview() {
  return (
    <NarrowPage spacing="relaxed">
      <IndexPageIntro
        title="Notifications"
        description="Your notification history beyond the latest bell preview."
        actions={
          <Button type="button" variant="outline">
            Mark all as read
          </Button>
        }
        showActionsInHeader
      />
      <NotificationInboxBody
        isPending={false}
        isError={false}
        itemCount={previewItems.length}
        previewItems={[...previewItems]}
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
