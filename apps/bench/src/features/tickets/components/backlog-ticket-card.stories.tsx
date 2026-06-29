import type { Meta, StoryObj } from '@storybook/react-vite'

import { sampleTicket } from '../test-fixtures'
import { BacklogTicketCard } from './backlog-ticket-card'

const meta = {
  title: 'Bench/BacklogTicketCard',
  component: BacklogTicketCard,
} satisfies Meta<typeof BacklogTicketCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ticket: sampleTicket,
    epic: { id: 'epic-1', title: 'Dev Bench MVP', badgeColor: '#6366f1' },
    onSelect: () => undefined,
  },
}
