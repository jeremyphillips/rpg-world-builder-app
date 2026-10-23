import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationBell } from './notification-bell.client'

const meta = {
  title: 'Components/NotificationBell',
  component: NotificationBell,
  parameters: { layout: 'centered' },
  args: {
    unreadCount: 0,
  },
} satisfies Meta<typeof NotificationBell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithUnread: Story = {
  args: {
    unreadCount: 3,
  },
}
