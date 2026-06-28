import type { Meta, StoryObj } from '@storybook/react-vite'

import { emptyBenchColumns, populatedBenchColumns } from '../test-fixtures'
import { BenchBoard } from './bench-board'

const meta = {
  title: 'Bench/Workflow/BenchBoard',
  component: BenchBoard,
} satisfies Meta<typeof BenchBoard>

export default meta
type Story = StoryObj<typeof meta>

const epicTitleById = new Map([['epic-1', 'Dev Bench MVP']])

export const Empty: Story = {
  args: {
    columns: emptyBenchColumns(),
    epicTitleById,
  },
}

export const Populated: Story = {
  args: {
    columns: populatedBenchColumns(),
    epicTitleById,
  },
}

export const Loading: Story = {
  args: {
    columns: emptyBenchColumns(),
    epicTitleById,
    isPending: true,
  },
}

export const Error: Story = {
  args: {
    columns: emptyBenchColumns(),
    epicTitleById,
    isError: true,
    onRetry: () => undefined,
  },
}
