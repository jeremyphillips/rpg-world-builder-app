import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { emptyBenchColumns, populatedBenchColumns } from '../test-fixtures'
import { BenchBoard } from './bench-board'

const meta = {
  title: 'Bench/Workflow/BenchBoard',
  component: BenchBoard,
} satisfies Meta<typeof BenchBoard>

export default meta
type Story = StoryObj<typeof meta>

const epicTitleById = new Map([['epic-1', 'Dev Bench MVP']])

function BoardStory(props: React.ComponentProps<typeof BenchBoard>) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BenchBoard {...props} />
    </QueryClientProvider>
  )
}

export const Empty: Story = {
  args: {
    columns: emptyBenchColumns(),
    epicTitleById,
  },
  render: (args) => <BoardStory {...args} />,
}

export const Populated: Story = {
  args: {
    columns: populatedBenchColumns(),
    epicTitleById,
  },
  render: (args) => <BoardStory {...args} />,
}

export const Loading: Story = {
  args: {
    columns: emptyBenchColumns(),
    epicTitleById,
    isPending: true,
  },
  render: (args) => <BoardStory {...args} />,
}

export const Error: Story = {
  args: {
    columns: emptyBenchColumns(),
    epicTitleById,
    isError: true,
    onRetry: () => undefined,
  },
  render: (args) => <BoardStory {...args} />,
}
