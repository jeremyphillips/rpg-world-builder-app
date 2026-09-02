import type { Meta, StoryObj } from '@storybook/react-vite'

import { NewMessageForm } from '../new-message-form'

const meta = {
  title: 'Message/NewMessageForm',
  component: NewMessageForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NewMessageForm>

export default meta

type Story = StoryObj<typeof NewMessageForm>

export const Default: Story = {
  args: {
    recipients: [
      { userId: 'user-2', displayName: 'Campaign Member' },
      { userId: 'user-3', displayName: 'Dungeon Master' },
    ],
    recipientUserId: '',
    onRecipientChange: () => undefined,
  },
}

export const SelectedRecipient: Story = {
  args: {
    ...Default.args,
    recipientUserId: 'user-2',
  },
}
