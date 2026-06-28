import type { Meta, StoryObj } from '@storybook/react-vite'

import { sampleEpic, sampleEpicTickets } from '../test-fixtures'
import { EpicCard } from './epic-card'

const meta = {
  title: 'Bench/Epics/EpicCard',
  component: EpicCard,
} satisfies Meta<typeof EpicCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    epic: sampleEpic,
    counts: { open: 2, blocked: 1, done: 1 },
    recentlyActive: sampleEpicTickets.slice(0, 2),
  },
}

export const EmptyRecentlyActive: Story = {
  args: {
    epic: sampleEpic,
    counts: { open: 0, blocked: 0, done: 0 },
    recentlyActive: [],
  },
}
