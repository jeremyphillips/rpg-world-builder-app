import type { Meta, StoryObj } from '@storybook/react-vite'

import { sampleTicket } from '../test-fixtures'
import { TicketCardBacklogMenu } from './ticket-card-backlog-menu'

const meta = {
  title: 'Bench/TicketCardBacklogMenu',
  component: TicketCardBacklogMenu,
} satisfies Meta<typeof TicketCardBacklogMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ticket: sampleTicket,
    onAddToBench: () => undefined,
  },
}
