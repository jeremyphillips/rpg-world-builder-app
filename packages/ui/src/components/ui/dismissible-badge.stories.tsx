import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { DismissibleBadge } from './dismissible-badge.client'

const meta = {
  title: 'UI/DismissibleBadge',
  component: DismissibleBadge,
  parameters: { layout: 'padded' },
  args: {
    label: 'Dagger',
    onDismiss: action('onDismiss'),
  },
} satisfies Meta<typeof DismissibleBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: {
    variant: 'outline',
    label: 'Fire Bolt',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Longsword',
  },
}

export const Group: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Selected weapons">
      <DismissibleBadge {...args} label="Dagger" />
      <DismissibleBadge {...args} label="Rapier" />
      <DismissibleBadge {...args} label="Longsword" />
    </div>
  ),
}
