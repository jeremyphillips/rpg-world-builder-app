import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationInboxBody } from './notification-inbox-body'
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
    title: 'Campaign invitation',
    description: 'Blake invited you to join Stormwatch.',
    timestamp: '2 hours ago',
    unread: false,
    onActivate: () => undefined,
  },
] as const

const meta = {
  title: 'Notification/NotificationInboxBody',
  component: NotificationInboxBody,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationInboxBody>

export default meta

type Story = StoryObj<typeof NotificationInboxBody>

export const Loading: Story = {
  args: {
    isPending: true,
    isError: false,
    itemCount: 0,
    previewItems: [],
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    onLoadMore: () => undefined,
  },
}

export const Error: Story = {
  args: {
    isPending: false,
    isError: true,
    itemCount: 0,
    previewItems: [],
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    onRetry: () => undefined,
    onLoadMore: () => undefined,
  },
}

export const Empty: Story = {
  args: {
    isPending: false,
    isError: false,
    itemCount: 0,
    previewItems: [],
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    onLoadMore: () => undefined,
  },
}

export const WithItems: Story = {
  args: {
    isPending: false,
    isError: false,
    itemCount: previewItems.length,
    previewItems: [...previewItems],
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
    hasNextPage: true,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    onLoadMore: () => undefined,
  },
}

export const LoadMoreError: Story = {
  args: {
    isPending: false,
    isError: false,
    itemCount: previewItems.length,
    previewItems: [...previewItems],
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
    hasNextPage: true,
    isFetchingNextPage: false,
    isFetchNextPageError: true,
    onLoadMore: () => undefined,
  },
}
