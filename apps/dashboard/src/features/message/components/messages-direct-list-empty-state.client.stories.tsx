import type { Meta, StoryObj } from '@storybook/react-vite'

import { MessagesDirectListEmptyState } from './messages-direct-list-empty-state.client'

const meta = {
  title: 'Message/MessagesDirectListEmptyState',
  component: MessagesDirectListEmptyState,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MessagesDirectListEmptyState>

export default meta

type Story = StoryObj<typeof MessagesDirectListEmptyState>

export const GlobalEmpty: Story = {
  args: {
    isScopedEmpty: false,
  },
}

export const ScopedEmpty: Story = {
  args: {
    campaignId: 'camp-1',
    isScopedEmpty: true,
  },
}
