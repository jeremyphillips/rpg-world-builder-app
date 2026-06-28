import type { Meta, StoryObj } from '@storybook/react-vite'

import { PriorityBadge } from './priority-badge'
import { SizeBadge } from './size-badge'
import { TypeBadge } from './type-badge'

const meta = {
  title: 'Bench/TicketBadges',
} satisfies Meta

export default meta

export const PriorityVariants: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PriorityBadge priority="low" />
      <PriorityBadge priority="medium" />
      <PriorityBadge priority="high" />
      <PriorityBadge priority="critical" />
    </div>
  ),
}

export const TypeAndSize: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <TypeBadge type="bug" />
      <TypeBadge type="feature" />
      <SizeBadge size="xs" />
      <SizeBadge size="xl" />
    </div>
  ),
}
