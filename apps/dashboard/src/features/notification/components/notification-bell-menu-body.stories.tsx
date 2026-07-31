import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationBellMenuBody } from './notification-bell-menu-body'

const previewItems = [
  {
    id: 'notification-1',
    title: 'Campaign invitation',
    description: 'Ava invited you to join Stormwatch. Open the invite email to accept.',
    timestamp: '2 minutes ago',
    unread: true,
    actionLabel: undefined,
    onActivate: () => undefined,
  },
  {
    id: 'notification-2',
    title: 'Invitation accepted',
    description: 'Blake accepted your invitation to Harbor.',
    timestamp: '1 hour ago',
    unread: false,
    actionLabel: 'Open',
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
  },
}

export const Error: Story = {
  args: {
    isLoading: false,
    isError: true,
    itemCount: 0,
    previewItems: [],
    onRetry: () => undefined,
  },
}

export const Empty: Story = {
  args: {
    isLoading: false,
    isError: false,
    itemCount: 0,
    previewItems: [],
  },
}

export const WithItems: Story = {
  args: {
    isLoading: false,
    isError: false,
    itemCount: previewItems.length,
    previewItems: [...previewItems],
  },
}
