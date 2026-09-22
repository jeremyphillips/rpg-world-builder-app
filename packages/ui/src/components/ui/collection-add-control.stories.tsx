import type { Meta, StoryObj } from '@storybook/react-vite'

import { CollectionAddControl } from './collection-add-control.client'

const meta = {
  title: 'UI/CollectionAddControl',
  component: CollectionAddControl,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CollectionAddControl>

export default meta
type Story = StoryObj<typeof meta>

export const Enabled: Story = {
  args: {
    label: 'Add residence',
    enabled: true,
    onClick: () => undefined,
  },
}

export const DisabledWithReason: Story = {
  name: 'Disabled with reason',
  args: {
    label: 'Add residence',
    enabled: false,
    disabledReason: 'Loading residence locations…',
  },
}
