/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ColumnDef } from '@rpg/ui'
import { SortableHeader } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { CatalogOverviewTable } from './catalog-overview-table.client'
import { catalogOverviewPreferencesKey } from './catalog-overview-preferences'

type RosterRow = {
  id: string
  name: string
  role: string
}

const ROSTER: RosterRow[] = [
  { id: '1', name: 'Aldric', role: 'guard' },
  { id: '2', name: 'Mira', role: 'merchant' },
  { id: '3', name: 'Thorn', role: 'guard' },
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
      ],
      getValue: (row) => row.role,
    }),
  ],
}

describe('CatalogOverviewTable', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the utility strip with a result count and column visibility trigger', () => {
    render(
      <CatalogOverviewTable
        tableKey="roster-test"
        columns={COLUMNS}
        data={ROSTER}
        caption="Campaign roster"
      />,
    )

    expect(screen.getByText('3 results')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose visible columns' })).toBeInTheDocument()
    expect(screen.getByText('Campaign roster')).toBeInTheDocument()
  })

  it('filters rows when a controlled filter state is provided', () => {
    render(
      <CatalogOverviewTable
        tableKey="roster-filtered"
        columns={COLUMNS}
        data={ROSTER}
        filterSchema={rosterFilterSchema}
        filterState={{ role: 'guard' }}
        onFilterChange={() => undefined}
        onResetFilters={() => undefined}
      />,
    )

    expect(screen.getByText('2 results')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Aldric' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Thorn' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'Mira' })).not.toBeInTheDocument()
  })

  it('persists column visibility preferences by table key', async () => {
    const user = userEvent.setup()

    render(<CatalogOverviewTable tableKey="roster-prefs" columns={COLUMNS} data={ROSTER} />)

    await user.click(screen.getByRole('button', { name: 'Choose visible columns' }))
    await user.click(screen.getByRole('button', { name: 'Hide Role column' }))

    const stored = JSON.parse(
      localStorage.getItem(catalogOverviewPreferencesKey('roster-prefs')) ?? '{}',
    ) as { columnVisibility?: Record<string, boolean> }

    expect(stored.columnVisibility?.role).toBe(false)
  })
})
