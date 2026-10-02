import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatusIcon } from './status-icon.client'
import { STATUS_ICON_DEFAULT_SIZE, STATUS_ICON_VARIANTS } from './status-icon.variants'

const meta = {
  title: 'Primitives/StatusIcon',
  component: StatusIcon,
  parameters: { layout: 'centered' },
  args: {
    variant: 'ready',
    size: STATUS_ICON_DEFAULT_SIZE,
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

export const WithTooltip: Story = {
  args: {
    variant: 'ready',
    tooltip: true,
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
          <StatusIcon variant={variant} size="lg" />
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
      <StatusIcon variant="ready" size="lg" />
    </div>
  ),
}

/** Documents semantic rename: old sm == new md, old md == new lg; new sm is the 12px tier. */
export const SizeParity: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <StatusIcon variant="ready" size="md" tooltip={false} />
        <span className="text-sm text-muted-foreground">
          Former default / old <code className="text-foreground">sm</code> (16px) →{' '}
          <code className="text-foreground">md</code>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <StatusIcon variant="ready" size="lg" tooltip={false} />
        <span className="text-sm text-muted-foreground">
          Old <code className="text-foreground">md</code> (20px) →{' '}
          <code className="text-foreground">lg</code>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <StatusIcon variant="ready" size="sm" tooltip={false} />
        <span className="text-sm text-muted-foreground">
          New compact <code className="text-foreground">sm</code> (12px)
        </span>
      </div>
    </div>
  ),
}
