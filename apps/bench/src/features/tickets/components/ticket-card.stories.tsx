import type { Meta, StoryObj } from '@storybook/react-vite'

import { TicketCard } from './ticket-card'
import { blockedSampleTicket, sampleTicket } from '../test-fixtures'

const meta = {
  title: 'Bench/TicketCard',
  component: TicketCard,
} satisfies Meta<typeof TicketCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ticket: sampleTicket,
    epicTitle: 'Dev Bench MVP',
    onSelect: () => undefined,
  },
}

export const Blocked: Story = {
  args: {
    ticket: blockedSampleTicket,
    onSelect: () => undefined,
  },
}

export const NoEpic: Story = {
  args: {
    ticket: { ...sampleTicket, epicId: null, area: undefined },
    onSelect: () => undefined,
  },
}
