import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineInactiveStatus } from './inline-inactive-status.client'

const meta = {
  title: 'Components/InlineInactiveStatus',
  component: InlineInactiveStatus,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InlineInactiveStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Unavailable: Story = {
  args: {
    label: 'Unavailable',
  },
}
