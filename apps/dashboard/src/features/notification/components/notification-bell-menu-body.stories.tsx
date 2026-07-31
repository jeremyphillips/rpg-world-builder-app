import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationBellMenuBody } from './notification-bell-menu-body'

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

const meta = {
  title: 'Notification/NotificationBellMenuBody',
  component: NotificationBellMenuBody,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(100vw-2rem,24rem)] rounded-md border border-border bg-popover shadow-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationBellMenuBody>

export default meta

type Story = StoryObj<typeof NotificationBellMenuBody>

export const Loading: Story = {
  args: {
    isLoading: true,
    isError: false,
    itemCount: 0,
    previewItems: [],
    notificationsViewAllHref: '/notifications',
  },
}

export const Error: Story = {
  args: {
    isLoading: false,
    isError: true,
    itemCount: 0,
    previewItems: [],
    notificationsViewAllHref: '/notifications',
    onRetry: () => undefined,
  },
}

export const Empty: Story = {
  args: {
    isLoading: false,
    isError: false,
    itemCount: 0,
    previewItems: [],
    notificationsViewAllHref: '/notifications',
  },
}

export const WithItems: Story = {
  args: {
    isLoading: false,
    isError: false,
    itemCount: previewItems.length,
    previewItems: [...previewItems],
    notificationsViewAllHref: '/notifications',
  },
}

export const WithCampaignMessagesSection: Story = {
  args: {
    isLoading: false,
    isError: false,
    itemCount: previewItems.length,
    previewItems: [...previewItems],
    notificationsViewAllHref: '/notifications',
    campaignMessagesHref: '/messages?campaignId=camp_1',
  },
}
