import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './text'

import { COMPACT_LABEL_TONES } from './compact-label.lib'
import { StatusDot } from './status-dot'

const meta = {
  title: 'Primitives/StatusDot',
  component: StatusDot,
  parameters: { layout: 'centered' },
  args: {
    tone: 'info',
    size: 'sm',
  },
} satisfies Meta<typeof StatusDot>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Labeled dots inherit typography from the host — wrap like production meta / summary rows. */
export const WithLabel: Story = {
  render: (args) => (
    <Text variant="caption">
      <StatusDot {...args} />
    </Text>
  ),
  args: {
    label: 'Unread',
  },
}

export const Tones: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {COMPACT_LABEL_TONES.map((tone) => (
        <StatusDot key={tone} tone={tone} />
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot size="sm" tone="info" />
      <StatusDot size="md" tone="info" />
    </div>
  ),
}

export const Sunken: Story = {
  render: (args) => (
    <Text variant="caption" className="sm:text-sm">
      <StatusDot {...args} />
    </Text>
  ),
  args: {
    tone: 'sunken',
    label: 'Draft',
  },
}
