import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatusIcon } from './status-icon.client'
import { STATUS_ICON_VARIANTS } from './status-icon.variants'

const meta = {
  title: 'Primitives/StatusIcon',
  component: StatusIcon,
  parameters: { layout: 'centered' },
  args: {
    variant: 'ready',
    size: 'sm',
  },
} satisfies Meta<typeof StatusIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabel: Story = {
  args: {
    label: 'Ready',
  },
}

export const WithoutTooltip: Story = {
  args: {
    variant: 'ready',
    tooltip: false,
  },
}

export const CustomTooltip: Story = {
  args: {
    variant: 'ready',
    tooltip: 'Published and available',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {STATUS_ICON_VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <StatusIcon variant={variant} size="sm" />
          <StatusIcon variant={variant} size="md" />
          <span className="text-sm capitalize text-muted-foreground">{variant}</span>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <StatusIcon variant="ready" size="sm" />
      <StatusIcon variant="ready" size="md" />
    </div>
  ),
}
