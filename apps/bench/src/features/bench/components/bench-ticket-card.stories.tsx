import type { Meta, StoryObj } from '@storybook/react-vite'
import { DndContext } from '@dnd-kit/core'

import { upNextTicket } from '../test-fixtures'
import { BenchTicketCard } from './bench-ticket-card'

const meta = {
  title: 'Bench/Workflow/BenchTicketCard',
  component: BenchTicketCard,
} satisfies Meta<typeof BenchTicketCard>

export default meta
type Story = StoryObj<typeof meta>

function CardStory(props: React.ComponentProps<typeof BenchTicketCard>) {
  return (
    <DndContext>
      <ul className="max-w-sm">
        <BenchTicketCard {...props} />
      </ul>
    </DndContext>
  )
}

export const Default: Story = {
  args: {
    ticket: upNextTicket,
    column: 'up_next',
    epic: { id: 'epic-1', title: 'Dev Bench MVP', badgeColor: '#6366f1' },
    onSelect: () => undefined,
    onMove: () => undefined,
  },
  render: (args) => <CardStory {...args} />,
}

export const Blocked: Story = {
  args: {
    ticket: { ...upNextTicket, blockedByTicketIds: ['blocker-id'] },
    column: 'blocked',
    onSelect: () => undefined,
    onMove: () => undefined,
  },
  render: (args) => <CardStory {...args} />,
}
