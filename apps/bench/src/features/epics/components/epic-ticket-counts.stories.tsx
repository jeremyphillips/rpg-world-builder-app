import type { Meta, StoryObj } from '@storybook/react-vite'

import { EpicTicketCounts } from './epic-ticket-counts'

const meta = {
  title: 'Bench/Epics/EpicTicketCounts',
  component: EpicTicketCounts,
} satisfies Meta<typeof EpicTicketCounts>

export default meta
type Story = StoryObj<typeof meta>

export const WithCounts: Story = {
  args: { counts: { open: 3, blocked: 1, done: 5 } },
}

export const ZeroCounts: Story = {
  args: { counts: { open: 0, blocked: 0, done: 0 } },
}
