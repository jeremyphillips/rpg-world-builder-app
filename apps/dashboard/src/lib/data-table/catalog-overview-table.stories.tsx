import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@rpg/ui'
import { SortableHeader } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { CatalogOverviewTable } from './catalog-overview-table'

type RosterRow = {
  id: string
  name: string
  role: string
}

const ROSTER: RosterRow[] = [
  { id: '1', name: 'Aldric Vale', role: 'guard' },
  { id: '2', name: 'Mira Thornwick', role: 'merchant' },
  { id: '3', name: 'Thorn Ashford', role: 'guard' },
  { id: '4', name: 'Selene Dusk', role: 'scholar' },
]

const COLUMNS: ColumnDef<RosterRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    meta: { label: 'Name', locked: true },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: { label: 'Role' },
  },
]

type RosterFilterState = {
  role?: string
}

const rosterFilterSchema = {
  fields: [
    createEqualsFilter<RosterRow, RosterFilterState, 'role', string>({
      id: 'role',
      label: 'Role',
      options: [
        { label: 'Guard', value: 'guard' },
        { label: 'Merchant', value: 'merchant' },
        { label: 'Scholar', value: 'scholar' },
      ],
      getValue: (row) => row.role,
    }),
  ],
}

const meta = {
  title: 'DataTable/CatalogOverviewTable',
  component: CatalogOverviewTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogOverviewTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <CatalogOverviewTable
      tableKey="story-roster"
      columns={COLUMNS}
      data={ROSTER}
      caption="Example catalog overview shell"
    />
  ),
}

export const WithFilters: Story = {
  render: () => (
    <CatalogOverviewTable
      tableKey="story-roster-filtered"
      columns={COLUMNS}
      data={ROSTER}
      filterSchema={rosterFilterSchema}
      caption="Catalog overview with FilterBar chrome"
    />
  ),
}
