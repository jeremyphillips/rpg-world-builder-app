import type { Meta, StoryObj } from '@storybook/react-vite'

import { GlobalSearchTrigger } from './global-search-trigger.client'

const meta = {
  title: 'GlobalSearch/GlobalSearchTrigger',
  component: GlobalSearchTrigger,
} satisfies Meta<typeof GlobalSearchTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Enabled: Story = {
  args: {
    disabled: false,
    onOpen: () => undefined,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    onOpen: () => undefined,
  },
}
