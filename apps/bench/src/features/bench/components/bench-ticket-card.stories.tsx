import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { blockedBenchTicket, upNextTicket } from '../test-fixtures'
import { BenchTicketCard } from './bench-ticket-card'

const meta = {
  title: 'Bench/Workflow/BenchTicketCard',
  component: BenchTicketCard,
} satisfies Meta<typeof BenchTicketCard>

export default meta
type Story = StoryObj<typeof meta>

function CardStory(props: React.ComponentProps<typeof BenchTicketCard>) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BenchTicketCard {...props} />
    </QueryClientProvider>
  )
}

export const Default: Story = {
  args: {
    ticket: upNextTicket,
    epicTitle: 'Dev Bench MVP',
    onSelect: () => undefined,
  },
  render: (args) => <CardStory {...args} />,
}

export const Blocked: Story = {
  args: {
    ticket: blockedBenchTicket,
    onSelect: () => undefined,
  },
  render: (args) => <CardStory {...args} />,
}
