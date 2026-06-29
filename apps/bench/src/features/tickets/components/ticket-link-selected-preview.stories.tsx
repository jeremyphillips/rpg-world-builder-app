import type { Meta, StoryObj } from '@storybook/react-vite'

import { sampleTicket } from '../test-fixtures'
import { TicketLinkSelectedPreview } from './ticket-link-selected-preview'

const meta = {
  title: 'Bench/TicketLinkSelectedPreview',
  component: TicketLinkSelectedPreview,
  args: {
    option: {
      value: sampleTicket.id,
      label: `${sampleTicket.key} — ${sampleTicket.title}`,
      description: sampleTicket.status,
    },
    ticket: sampleTicket,
    onRemove: () => undefined,
  },
} satisfies Meta<typeof TicketLinkSelectedPreview>

export default meta
type Story = StoryObj<typeof meta>

export const WithTicket: Story = {}

export const StaleSelection: Story = {
  args: {
    ticket: null,
    option: {
      value: 'missing-ticket',
      label: '507f1f77bcf86cd799439011',
    },
  },
}
