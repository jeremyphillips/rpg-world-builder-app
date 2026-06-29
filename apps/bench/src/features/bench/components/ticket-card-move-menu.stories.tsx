import type { Meta, StoryObj } from '@storybook/react-vite'

import { upNextTicket } from '../test-fixtures'
import { TicketCardMoveMenu } from './ticket-card-move-menu'

const meta = {
  title: 'Bench/Workflow/TicketCardMoveMenu',
  component: TicketCardMoveMenu,
} satisfies Meta<typeof TicketCardMoveMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ticket: upNextTicket,
    onMove: () => undefined,
  },
}
