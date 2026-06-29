import type { Meta, StoryObj } from '@storybook/react-vite'
import { DndContext } from '@dnd-kit/core'

import { emptyBenchColumns, upNextTicket } from '../test-fixtures'
import { BenchColumn } from './bench-column'

const meta = {
  title: 'Bench/Workflow/BenchColumn',
  component: BenchColumn,
} satisfies Meta<typeof BenchColumn>

export default meta
type Story = StoryObj<typeof meta>

const epicTitleById = new Map([['epic-1', 'Dev Bench MVP']])

function ColumnStory(props: React.ComponentProps<typeof BenchColumn>) {
  return (
    <DndContext>
      <BenchColumn {...props} />
    </DndContext>
  )
}

export const Empty: Story = {
  args: {
    column: 'up_next',
    tickets: emptyBenchColumns().up_next,
    epicTitleById,
    isDragActive: false,
    onMoveTicket: () => undefined,
  },
  render: (args) => <ColumnStory {...args} />,
}

export const WithTickets: Story = {
  args: {
    column: 'up_next',
    tickets: [{ ...upNextTicket, epicId: 'epic-1' }],
    epicTitleById,
    isDragActive: false,
    onMoveTicket: () => undefined,
  },
  render: (args) => <ColumnStory {...args} />,
}
