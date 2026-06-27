import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Badge' },
}

export const Secondary: Story = {
  args: { children: 'System', variant: 'secondary' },
}

export const Outline: Story = {
  args: { children: 'Homebrew', variant: 'outline' },
}

export const Small: Story = {
  name: 'Small (table source)',
  args: { children: 'System', size: 'sm', variant: 'secondary' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm" variant="secondary">
        sm
      </Badge>
      <Badge size="md" variant="secondary">
        md
      </Badge>
    </div>
  ),
}
