import type { Meta, StoryObj } from '@storybook/react-vite'

import { SubmitButton } from './submit-button'

const meta = {
  title: 'Forms/SubmitButton',
  component: SubmitButton,
  args: {
    children: 'Create',
  },
} satisfies Meta<typeof SubmitButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pending: Story = {
  args: { pending: true, pendingLabel: 'Creating…' },
}

export const Disabled: Story = {
  args: { disabled: true },
}
