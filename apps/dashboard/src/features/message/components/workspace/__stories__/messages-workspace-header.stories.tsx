import type { Meta, StoryObj } from '@storybook/react-vite'

import { MessagesWorkspaceHeader } from '../messages-workspace-header'

const meta = {
  title: 'Message/MessagesWorkspaceHeader',
  component: MessagesWorkspaceHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MessagesWorkspaceHeader>

export default meta

type Story = StoryObj<typeof MessagesWorkspaceHeader>

export const Default: Story = {
  args: {
    isNewRoute: false,
    onNewMessage: () => undefined,
    onCancel: () => undefined,
  },
}

export const RecipientMode: Story = {
  args: {
    isNewRoute: true,
    onNewMessage: () => undefined,
    onCancel: () => undefined,
  },
}
