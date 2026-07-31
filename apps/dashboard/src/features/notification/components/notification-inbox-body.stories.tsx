import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationInboxBody } from './notification-inbox-body.client'

const previewItems = [
  {
    id: 'notification-1',
    title: 'New message',
    description: 'Ava sent you a message in Harbor.',
    timestamp: '2 minutes ago',
    unread: true,
    actionLabel: 'Open',
    onActivate: () => undefined,
  },
  {
    id: 'notification-2',
    title: 'Campaign invitation',
    description: 'Blake invited you to join Stormwatch.',
    timestamp: '1 hour ago',
    unread: false,
    actionLabel: undefined,
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
    hasNextPage: true,
    isFetchingNextPage: false,
    isFetchNextPageError: true,
    onLoadMore: () => undefined,
  },
}
