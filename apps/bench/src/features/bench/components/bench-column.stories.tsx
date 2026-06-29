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

const epicMetaById = new Map([
  ['epic-1', { id: 'epic-1', title: 'Dev Bench MVP', badgeColor: '#6366f1' }],
])

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
    epicMetaById,
    isDragActive: false,
    onMoveTicket: () => undefined,
  },
  render: (args) => <ColumnStory {...args} />,
}

export const WithTickets: Story = {
  args: {
    column: 'up_next',
    tickets: [{ ...upNextTicket, epicId: 'epic-1' }],
    epicMetaById,
    isDragActive: false,
    onMoveTicket: () => undefined,
  },
  render: (args) => <ColumnStory {...args} />,
}
