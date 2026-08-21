import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { PageHeader } from '@/components/layout/page/page-header'
import { pageHeaderSectionGapClasses } from '@/components/layout/page/page-spacing.variants'

import { NotificationInboxBody } from '../components/notification-inbox-body'
import { NotificationInboxHeader } from '../components/notification-inbox-header'
import { createNotificationInboxFilterSchema } from '../lib/notification-inbox-filter-schema'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

const schema = createNotificationInboxFilterSchema([
  { value: 'campaign-1', label: 'Stormwatch' },
  { value: 'campaign-2', label: 'Harbor' },
])

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
      <div className={pageHeaderSectionGapClasses}>
        <PageHeader
          heading={NOTIFICATION_COPY.title}
          actions={
            <Button type="button" variant="ghost" size="sm" density="compact">
              {NOTIFICATION_COPY.markAllAsRead}
            </Button>
          }
        />
        <NotificationInboxHeader
          schema={schema}
          filters={{ unread: true, category: 'message' }}
          onFilterChange={() => undefined}
          clearFilterField={() => undefined}
          resetFilters={() => undefined}
        />
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
