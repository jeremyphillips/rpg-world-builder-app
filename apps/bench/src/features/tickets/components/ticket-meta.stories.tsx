import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'

import { sampleTicket } from '../test-fixtures'

import { TicketMeta } from './ticket-meta'

const meta: Meta<typeof TicketMeta> = {
  title: 'Bench/TicketMeta',
  component: TicketMeta,
}

export default meta
type Story = StoryObj<typeof meta>

function TicketMetaStory(props: ComponentProps<typeof TicketMeta>) {
  return (
    <MemoryRouter>
      <TicketMeta {...props} />
    </MemoryRouter>
  )
}

export const Default: Story = {
  args: {
    ticket: sampleTicket,
  },
  render: (args) => <TicketMetaStory {...args} />,
}

export const WithDetailLink: Story = {
  args: {
    ticket: sampleTicket,
    detailHref: `/bench/tickets/${sampleTicket.id}`,
  },
  render: (args) => <TicketMetaStory {...args} />,
}
