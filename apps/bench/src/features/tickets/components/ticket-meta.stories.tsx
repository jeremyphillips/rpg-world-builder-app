import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'

import { sampleTicket } from '../test-fixtures'

import { TicketMeta } from './ticket-meta'

const meta = {
  title: 'Bench/TicketMeta',
  component: TicketMeta,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof TicketMeta>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ticket: sampleTicket,
  },
}

export const WithDetailLink: Story = {
  args: {
    ticket: sampleTicket,
    detailHref: `/bench/tickets/${sampleTicket.id}`,
  },
}
