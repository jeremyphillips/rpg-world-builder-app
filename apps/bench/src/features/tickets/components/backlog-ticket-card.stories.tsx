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
    epicTitle: 'Dev Bench MVP',
    onSelect: () => undefined,
  },
}
