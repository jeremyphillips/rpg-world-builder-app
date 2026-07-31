import type { Meta, StoryObj } from '@storybook/react-vite'

import { NewMessageForm } from './new-message-form.client'

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
    onSubmit: (event) => event.preventDefault(),
    onCancel: () => undefined,
    isSubmitting: false,
  },
}

export const Submitting: Story = {
  args: {
    ...Default.args,
    recipientUserId: 'user-2',
    isSubmitting: true,
  },
}
