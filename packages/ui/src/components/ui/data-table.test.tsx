import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import type { ColumnDef } from '@tanstack/react-table'

import {
  BooleanCell,
  DataTable,
  NameCell,
  RowActionsMenu,
  SortableHeader,
  TableBadgeCell,
} from './data-table.client'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface Item {
  id: string
  name: string
  category: string
  active: boolean
}

const DATA: Item[] = [
  { id: '1', name: 'Alpha', category: 'warrior', active: true },
  { id: '2', name: 'Beta', category: 'caster', active: false },
  { id: '3', name: 'Gamma', category: 'warrior', active: true },
  { id: '4', name: 'Delta', category: 'caster', active: false },
  { id: '5', name: 'Epsilon', category: 'rogue', active: true },
]

const COLUMNS: ColumnDef<Item>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'active',
    header: 'Active',
    cell: ({ row }) => <BooleanCell value={row.getValue('active')} />,
  },
]

function renderTable(overrides: Partial<Parameters<typeof DataTable<Item>>[0]> = {}) {
  return render(<DataTable columns={COLUMNS} data={DATA} defaultPageSize={10} {...overrides} />)
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('DataTable — rendering', () => {
  it('renders all rows by default', () => {
    renderTable()
    // +1 for the header row
    expect(screen.getAllByRole('row')).toHaveLength(DATA.length + 1)
  })

  it('renders column headers via columnheader role', () => {
    renderTable()
    // <th> inside <thead> has role="columnheader"
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Active' })).toBeInTheDocument()
  })

  it('renders the sortable Name column header', () => {
    renderTable()
    // SortableHeader renders a button inside the <th>
    expect(screen.getByRole('button', { name: /sort by name/i })).toBeInTheDocument()
  })

  it('renders empty-state row when data is empty', () => {
    renderTable({ data: [] })
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('renders caption when provided', () => {
    renderTable({ caption: 'All items' })
    const caption = screen.getByText('All items')
    expect(caption).toBeInTheDocument()
    expect(caption).toHaveClass('text-sm-meta', 'italic', 'text-muted-foreground')
  })

  it('renders the Columns button', () => {
    renderTable()
    expect(screen.getByRole('button', { name: /columns/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Shared cell helpers
// ---------------------------------------------------------------------------

describe('DataTable cell helpers', () => {
  it('NameCell renders semibold text', () => {
    render(<NameCell>Barbarian</NameCell>)
    expect(screen.getByText('Barbarian')).toHaveClass('font-data-name')
  })

  it('TableBadgeCell renders a compact badge', () => {
    render(
      <TableBadgeCell appearance="neutral" tone="neutral">
        System
      </TableBadgeCell>,
    )
    expect(screen.getByText('System')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Column sorting
// ---------------------------------------------------------------------------

describe('DataTable — sorting', () => {
  it('marks sortable headers with aria-sort="none" before sorting', () => {
    renderTable()
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
    expect(nameHeader).toHaveAttribute('aria-sort', 'none')
  })

  it('updates aria-sort after clicking a sortable header', async () => {
    const user = userEvent.setup()
    renderTable()

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
    await user.click(screen.getByRole('button', { name: /sort by name/i }))

    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
  })

  it('shows a directional chevron on the actively sorted column', async () => {
    const user = userEvent.setup()
    const { container } = renderTable()

    const sortButton = screen.getByRole('button', { name: /sort by name/i })
    expect(sortButton.querySelector('.lucide-chevron-up')).not.toBeInTheDocument()

    await user.click(sortButton)

    expect(sortButton.querySelector('.lucide-chevron-up')).toBeInTheDocument()
    expect(container.querySelector('.lucide-arrow-up-down')).not.toBeInTheDocument()
  })

  it('applies column tone classes to body cells', () => {
    const tonedColumns: ColumnDef<Item>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { columnTone: 'identity' },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        meta: { columnTone: 'data' },
      },
      {
        accessorKey: 'active',
        header: 'Active',
        cell: ({ row }) => <BooleanCell value={row.getValue('active')} />,
        meta: { columnTone: 'neutral' },
      },
    ]

    renderTable({ columns: tonedColumns })

    const rows = screen.getAllByRole('row').slice(1)
    const firstRowCells = within(rows[0]!).getAllByRole('cell')

    expect(firstRowCells[0]).not.toHaveClass('bg-control-selected')
    expect(firstRowCells[0]).not.toHaveClass('text-muted-foreground')
    expect(firstRowCells[1]).toHaveClass('text-muted-foreground')
    expect(firstRowCells[1]).not.toHaveClass('bg-surface-muted')
    expect(firstRowCells[2]).not.toHaveClass('bg-surface-muted')
    expect(firstRowCells[2]).not.toHaveClass('bg-control-selected')
  })
})

// ---------------------------------------------------------------------------
// Row selection
// ---------------------------------------------------------------------------

describe('DataTable — row selection', () => {
  it('does not render selection checkboxes by default', () => {
    renderTable()
    expect(screen.queryByRole('checkbox', { name: 'Select row' })).not.toBeInTheDocument()
  })

  it('renders a select-all checkbox in the header when enableRowSelection is true', () => {
    renderTable({ enableRowSelection: true })
    const [headerRow] = screen.getAllByRole('row')
    expect(
      within(headerRow!).getByRole('checkbox', { name: 'Select all rows on this page' }),
    ).toBeInTheDocument()
  })

  it('renders per-row checkboxes when enableRowSelection is true', () => {
    renderTable({ enableRowSelection: true })
    expect(screen.getAllByRole('checkbox', { name: 'Select row' })).toHaveLength(DATA.length)
  })

  it('calls onRowSelectionChange with the selected rows', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderTable({ enableRowSelection: true, onRowSelectionChange: onSelect })

    const [, firstDataRow] = screen.getAllByRole('row') // index 0 is header
    const firstRowCheckbox = within(firstDataRow!).getByRole('checkbox', { name: 'Select row' })
    await user.click(firstRowCheckbox)

    expect(onSelect).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Alpha' })]),
    )
  })

  it('selects all rows via the header checkbox', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderTable({ enableRowSelection: true, onRowSelectionChange: onSelect })

    const headerCheckbox = screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    await user.click(headerCheckbox)

    expect(onSelect).toHaveBeenLastCalledWith(
      expect.arrayContaining(DATA.map((d) => expect.objectContaining({ id: d.id }))),
    )
  })

  it('marks the row tr with data-state=selected when selected', async () => {
    const user = userEvent.setup()
    renderTable({ enableRowSelection: true })

    const [, firstDataRow] = screen.getAllByRole('row')
    await user.click(within(firstDataRow!).getByRole('checkbox', { name: 'Select row' }))

    expect(firstDataRow).toHaveAttribute('data-state', 'selected')
  })
})

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

describe('DataTable — row actions', () => {
  it('renders an actions cell in each row when rowActions is provided', () => {
    renderTable({
      rowActions: (row) => <button type="button">Edit {row.name}</button>,
    })
    expect(screen.getAllByRole('button', { name: /^Edit / })).toHaveLength(DATA.length)
  })

  it('does not notify onColumnChange on mount', () => {
    const onChange = vi.fn()
    render(<DataTable columns={COLUMNS} data={DATA} onColumnChange={onChange} />)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not notify onColumnChange again when the parent rerenders', () => {
    const onChange = vi.fn()
    const rowActions = (row: Item) => <button type="button">Edit {row.name}</button>

    const { rerender } = render(
      <DataTable columns={COLUMNS} data={DATA} onColumnChange={onChange} rowActions={rowActions} />,
    )

    const callsAfterMount = onChange.mock.calls.length

    for (let index = 0; index < 5; index += 1) {
      rerender(
        <DataTable
          columns={COLUMNS}
          data={DATA}
          onColumnChange={onChange}
          rowActions={rowActions}
        />,
      )
    }

    expect(onChange.mock.calls.length).toBe(callsAfterMount)
  })

  it('does not notify onColumnChange again when rowActions is reallocated each render', () => {
    const onChange = vi.fn()

    const { rerender } = render(
      <DataTable
        columns={COLUMNS}
        data={DATA}
        onColumnChange={onChange}
        rowActions={(row) => <button type="button">Edit {row.name}</button>}
      />,
    )

    const callsAfterMount = onChange.mock.calls.length

    for (let index = 0; index < 5; index += 1) {
      rerender(
        <DataTable
          columns={COLUMNS}
          data={DATA}
          onColumnChange={onChange}
          rowActions={(row) => <button type="button">Edit {row.name}</button>}
        />,
      )
    }

    expect(onChange.mock.calls.length).toBe(callsAfterMount)
  })
})

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

describe('DataTable — pagination', () => {
  it('shows the correct row count label', () => {
    renderTable()
    expect(screen.getByText(`1–${DATA.length} of ${DATA.length}`)).toBeInTheDocument()
  })

  it('disables Previous on the first page', () => {
    renderTable()
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled()
  })

  it('disables Next when all rows fit on one page', () => {
    renderTable()
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
  })

  it('enables Next when there are more rows than the page size', () => {
    renderTable({ defaultPageSize: 2 })
    expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBeDisabled()
  })

  it('navigates to the next page', async () => {
    const user = userEvent.setup()
    renderTable({ defaultPageSize: 2 })

    await user.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(screen.getByText(/3–4 of 5/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// BooleanCell
// ---------------------------------------------------------------------------

describe('BooleanCell', () => {
  it('renders a Check icon with aria-label "Yes" when value is true', () => {
    render(<BooleanCell value={true} />)
    expect(screen.getByLabelText('Yes')).toBeInTheDocument()
  })

  it('renders an X icon with aria-label "No" when value is false', () => {
    render(<BooleanCell value={false} />)
    expect(screen.getByLabelText('No')).toBeInTheDocument()
  })

  it('renders text "Yes" when icons is false and value is true', () => {
    render(<BooleanCell value={true} icons={false} />)
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('renders text "—" when icons is false and value is false', () => {
    render(<BooleanCell value={false} icons={false} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Column panel
// ---------------------------------------------------------------------------

describe('DataTable — column panel', () => {
  it('renders a Columns button', () => {
    renderTable()
    expect(screen.getByRole('button', { name: /columns/i })).toBeInTheDocument()
  })

  it('opens the column panel and shows a search input', async () => {
    const user = userEvent.setup()
    renderTable()
    await user.click(screen.getByRole('button', { name: /columns/i }))
    expect(screen.getByRole('searchbox', { name: /search columns/i })).toBeInTheDocument()
  })

  it('shows a Reset Column Order button in the column panel', async () => {
    const user = userEvent.setup()
    renderTable()
    await user.click(screen.getByRole('button', { name: /columns/i }))
    expect(screen.getByRole('button', { name: /reset column order/i })).toBeInTheDocument()
  })

  it('calls onColumnChange when a column is hidden', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderTable({ onColumnChange: onChange })

    await user.click(screen.getByRole('button', { name: /columns/i }))
    // Toggle the "Category" column off
    await user.click(screen.getByRole('button', { name: /hide category column/i }))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: expect.objectContaining({ category: false }),
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// RowActionsMenu
// ---------------------------------------------------------------------------

describe('RowActionsMenu', () => {
  it('renders an ellipsis trigger button', () => {
    render(<RowActionsMenu editHref="/edit/1" enabled={true} onToggleEnabled={vi.fn()} />)
    expect(screen.getByRole('button', { name: /open actions/i })).toBeInTheDocument()
  })

  it('shows Edit menu item and active toggle switch when opened', async () => {
    const user = userEvent.setup()
    render(<RowActionsMenu editHref="/edit/1" enabled={true} onToggleEnabled={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /open actions/i }))

    // DropdownMenuItem with asChild renders the anchor as role="menuitem"
    const editItem = screen.getByRole('menuitem', { name: /edit/i })
    expect(editItem).toBeInTheDocument()
    expect(editItem).toHaveAttribute('href', '/edit/1')
    expect(screen.getByRole('switch', { name: /active in campaign/i })).toBeInTheDocument()
  })

  it('reflects the enabled prop on the switch', async () => {
    const user = userEvent.setup()
    render(<RowActionsMenu editHref="/edit/1" enabled={false} onToggleEnabled={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /open actions/i }))

    expect(screen.getByRole('switch', { name: /active in campaign/i })).toHaveAttribute(
      'data-state',
      'unchecked',
    )
  })

  it('calls onToggleEnabled with the new value when the switch is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<RowActionsMenu editHref="/edit/1" enabled={true} onToggleEnabled={onToggle} />)

    await user.click(screen.getByRole('button', { name: /open actions/i }))
    await user.click(screen.getByRole('switch', { name: /active in campaign/i }))

    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('renders a custom enabledLabel', async () => {
    const user = userEvent.setup()
    render(
      <RowActionsMenu
        editHref="/edit/1"
        enabled={true}
        onToggleEnabled={vi.fn()}
        enabledLabel="Active in world"
      />,
    )

    await user.click(screen.getByRole('button', { name: /open actions/i }))

    expect(screen.getByRole('switch', { name: 'Active in world' })).toBeInTheDocument()
  })

  it('keeps the menu open after the switch is toggled', async () => {
    const user = userEvent.setup()
    render(<RowActionsMenu editHref="/edit/1" enabled={true} onToggleEnabled={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /open actions/i }))
    await user.click(screen.getByRole('switch', { name: /active in campaign/i }))

    expect(screen.getByRole('switch', { name: /active in campaign/i })).toBeInTheDocument()
  })

  it('renders a custom EditLink component when provided', async () => {
    const user = userEvent.setup()
    render(
      <RowActionsMenu
        editHref="/campaigns/c1/spells/fire-bolt/edit"
        enabled={true}
        onToggleEnabled={vi.fn()}
        EditLink={({ href, children }) => (
          <a href={href} data-testid="router-edit-link">
            {children}
          </a>
        )}
      />,
    )

    await user.click(screen.getByRole('button', { name: /open actions/i }))

    const editLink = screen.getByTestId('router-edit-link')
    expect(editLink).toHaveAttribute('href', '/campaigns/c1/spells/fire-bolt/edit')
    expect(editLink).toHaveTextContent('Edit')
  })

  it('renders a footer section instead of the legacy toggle', async () => {
    const user = userEvent.setup()
    render(
      <RowActionsMenu
        editHref="/edit/1"
        editLabel="Edit details"
        footer={<div>Campaign footer</div>}
      />,
    )

    await user.click(screen.getByRole('button', { name: /open actions/i }))

    expect(screen.getByText('Edit details')).toBeInTheDocument()
    expect(screen.getByText('Campaign footer')).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Extended table behavior
// ---------------------------------------------------------------------------

describe('DataTable — extended behavior', () => {
  it('renders a custom empty state', () => {
    renderTable({
      data: [],
      emptyState: () => <span>No available classes match these filters.</span>,
    })
    expect(screen.getByText('No available classes match these filters.')).toBeInTheDocument()
    expect(screen.queryByText('No results.')).not.toBeInTheDocument()
  })

  it('applies getRowClassName to body rows', () => {
    renderTable({
      getRowClassName: (row) => (row.original.active ? undefined : 'unavailable-row'),
    })

    const bodyRows = screen.getAllByRole('row').slice(1)
    expect(bodyRows.some((row) => row.classList.contains('unavailable-row'))).toBe(true)
  })

  it('applies getCellClassName to body cells', () => {
    renderTable({
      getCellClassName: (cell) => (cell.row.original.active ? undefined : `cell-${cell.column.id}`),
    })

    const inactiveCell = document.querySelector('td.cell-name')
    expect(inactiveCell).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('DataTable — accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = renderTable()
    await expectNoAxeViolations(container)
  })

  it('has no axe violations with row selection enabled', async () => {
    const { container } = renderTable({ enableRowSelection: true })
    await expectNoAxeViolations(container)
  })

  it('has no axe violations with the column panel open', async () => {
    const user = userEvent.setup()
    const { container } = renderTable()
    await user.click(screen.getByRole('button', { name: /columns/i }))
    await expectNoAxeViolations(container)
  })
})
