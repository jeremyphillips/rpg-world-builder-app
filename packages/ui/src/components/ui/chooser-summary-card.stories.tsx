import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ChooserSummaryCard } from './chooser-summary-card'

const meta = {
  title: 'Forms/ChooserSummaryCard',
  component: ChooserSummaryCard,
  args: {
    eyebrow: 'Connection type',
    changeLabel: 'Change connection type',
    title: 'Governs',
    description: 'Exercises political or administrative authority over this region.',
    onChange: () => {},
  },
} satisfies Meta<typeof ChooserSummaryCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Compact: Story = {
  args: {
    density: 'compact',
  },
}

export const WithoutDescription: Story = {
  args: {
    description: undefined,
  },
}

export const InteractiveChange: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState(false)

    return (
      <div className="space-y-4">
        {expanded ? (
          <p className="text-sm text-muted-foreground">Chooser expanded (story placeholder)</p>
        ) : (
          <ChooserSummaryCard {...args} onChange={() => setExpanded(true)} />
        )}
      </div>
    )
  },
}
