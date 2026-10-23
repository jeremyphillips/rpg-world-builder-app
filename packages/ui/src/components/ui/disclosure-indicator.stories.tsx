import type { Meta, StoryObj } from '@storybook/react-vite'

import { DisclosureIndicator } from './disclosure-indicator.client'

const meta = {
  title: 'UI/DisclosureIndicator',
  component: DisclosureIndicator,
  args: {
    size: 'lg',
  },
} satisfies Meta<typeof DisclosureIndicator>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Medium: Story = {
  args: { size: 'md' },
}
