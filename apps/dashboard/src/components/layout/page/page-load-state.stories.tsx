import { Text } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PageLoadState } from './page-load-state'

const meta = {
  title: 'Layout/PageLoadState',
  component: PageLoadState,
} satisfies Meta<typeof PageLoadState>

export default meta
type Story = StoryObj

export const Pending: Story = {
  args: {
    isPending: true,
    isError: false,
    children: <Text>Ready content</Text>,
  },
}

export const Error: Story = {
  args: {
    isPending: false,
    isError: true,
    errorLabel: 'Could not load species.',
    children: <Text>Ready content</Text>,
  },
}

export const Ready: Story = {
  args: {
    isPending: false,
    isError: false,
    children: <Text>Ready content</Text>,
  },
}
