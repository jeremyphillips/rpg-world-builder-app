import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { TicketCard } from './ticket-card'
import { blockedSampleTicket, sampleTicket } from '../test-fixtures'

const meta = {
  title: 'Bench/TicketCard',
  component: TicketCard,
} satisfies Meta<typeof TicketCard>

export default meta
type Story = StoryObj<typeof meta>

function TicketCardStory(props: ComponentProps<typeof TicketCard>) {
  return (
    <MemoryRouter>
      <TicketCard {...props} />
    </MemoryRouter>
  )
}

export const Default: Story = {
  args: {
    ticket: sampleTicket,
    epic: { id: 'epic-1', title: 'Dev Bench MVP', badgeColor: '#6366f1' },
    onSelect: () => undefined,
  },
  render: (args) => <TicketCardStory {...args} />,
}

export const Blocked: Story = {
  args: {
    ticket: blockedSampleTicket,
    onSelect: () => undefined,
  },
  render: (args) => <TicketCardStory {...args} />,
}

export const NoEpic: Story = {
  args: {
    ticket: { ...sampleTicket, epicId: null, area: undefined },
    epic: null,
    onSelect: () => undefined,
  },
  render: (args) => <TicketCardStory {...args} />,
}
