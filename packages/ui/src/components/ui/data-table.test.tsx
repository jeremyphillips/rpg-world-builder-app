import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

// Pull in the FilterFns augmentation from the component module so that
// `filterFn: 'boolean'` is a valid string literal in test column defs.
declare module '@tanstack/react-table' {
  interface FilterFns {
    boolean: FilterFn<unknown>
    equalsString: FilterFn<unknown>
  }
}

import {
  BooleanCell,
  DataTable,
  NameCell,
  RowActionsMenu,
  SortableHeader,
  TableBadgeCell,
} from './data-table.client'
import type { FilterDef } from './data-table.types'

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
    filterFn: 'boolean',
  },
]

const FILTERS: FilterDef[] = [
  { type: 'text', id: 'name', label: 'Name', placeholder: 'Search name…' },
  {
    type: 'select',
    id: 'category',
    label: 'Category',
    options: [
      { label: 'Warrior', value: 'warrior' },
      { label: 'Caster', value: 'caster' },
      { label: 'Rogue', value: 'rogue' },
    ],
  },
  { type: 'boolean', id: 'active', label: 'Active only' },
]

function renderTable(overrides: Partial<Parameters<typeof DataTable<Item>>[0]> = {}) {
  return render(
    <DataTable
      columns={COLUMNS}
      data={DATA}
      filters={FILTERS}
      defaultPageSize={10}
      {...overrides}
    />,
  )
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
    expect(caption).toHaveClass('text-sm-meta', 'italic', 'text-muted-foreground/80')
  })

  it('renders the primary filter controls', () => {
    renderTable()
    // Text filter input
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    // Select trigger (Radix renders as combobox)
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument()
  })

  it('renders the Filters and Columns buttons', () => {
    renderTable()
    expect(screen.getByRole('button', { name: /^Filters/ })).toBeInTheDocument()
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
    render(<TableBadgeCell variant="secondary">System</TableBadgeCell>)
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

    renderTable({ columns: tonedColumns, filters: [] })

    const rows = screen.getAllByRole('row').slice(1)
    const firstRowCells = within(rows[0]!).getAllByRole('cell')

    expect(firstRowCells[0]).toHaveClass('bg-accent/20')
    expect(firstRowCells[0]).not.toHaveClass('text-muted-foreground')
    expect(firstRowCells[1]).toHaveClass('bg-muted/10', 'text-muted-foreground')
    expect(firstRowCells[2]).toHaveClass('text-muted-foreground')
    expect(firstRowCells[2]).not.toHaveClass('bg-muted/10')
  })
})

// ---------------------------------------------------------------------------
// Text filter
// ---------------------------------------------------------------------------

describe('DataTable — text filter', () => {
  it('narrows rows as the user types', async () => {
    const user = userEvent.setup()
    renderTable()

    const input = screen.getByRole('textbox', { name: 'Name' })
    await user.type(input, 'al')

    // "Alpha" matches (case-insensitive includesString); others vanish
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })

  it('shows all rows when the text filter is cleared', async () => {
    const user = userEvent.setup()
    renderTable()

    const input = screen.getByRole('textbox', { name: 'Name' })
    await user.type(input, 'al')
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()

    await user.clear(input)
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('resets pagination to page 1 when a filter is applied', async () => {
    const user = userEvent.setup()
    // Use a small page size so there's a second page
    renderTable({ defaultPageSize: 2 })

    // Go to page 2
    await user.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(screen.getByText(/3–4 of 5/)).toBeInTheDocument()

    // Applying a filter should jump back to page 1
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'al')
    expect(screen.getByText(/1–/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Boolean filter (secondary group — collapsible panel, no portal)
// ---------------------------------------------------------------------------

describe('DataTable — boolean filter', () => {
  it('opens the advanced panel and shows secondary filters', async () => {
    const user = userEvent.setup()
    renderTable()

    // Panel is closed initially — boolean filter label should not be visible
    expect(screen.queryByRole('checkbox', { name: 'Active only' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Filters/ }))
    expect(screen.getByRole('checkbox', { name: 'Active only' })).toBeInTheDocument()
  })

  it('shows only active rows when the boolean filter is checked', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: /^Filters/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Active only' }))

    // Active items: Alpha, Gamma, Epsilon
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(screen.getByText('Epsilon')).toBeInTheDocument()
    // Inactive items
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
    expect(screen.queryByText('Delta')).not.toBeInTheDocument()
  })

  it('shows all rows again when the boolean filter is unchecked', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: /^Filters/ }))
    const checkbox = screen.getByRole('checkbox', { name: 'Active only' })
    await user.click(checkbox)
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()

    await user.click(checkbox)
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows active filter count badge on the Filters button', async () => {
    const user = userEvent.setup()
    renderTable()

    // The Filters toggle button has accessible name starting with "Filters"
    const filtersToggle = screen.getByRole('button', { name: /^Filters/ })
    await user.click(filtersToggle)
    await user.click(screen.getByRole('checkbox', { name: 'Active only' }))

    // The badge renders inside the button and shows the active count
    expect(
      within(screen.getByRole('button', { name: /^Filters/ })).getByText('1'),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Clear all filters
// ---------------------------------------------------------------------------

describe('DataTable — clear all', () => {
  it('resets all filters when "Clear all filters" is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    // Apply text filter
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Alpha')
    expect(screen.getAllByRole('row')).toHaveLength(2) // header + 1 result

    // Open advanced filters and apply boolean filter
    await user.click(screen.getByRole('button', { name: /^Filters/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Active only' }))

    // "Clear all filters" button appears when any filter is active
    await user.click(screen.getByRole('button', { name: /clear all filters/i }))
    expect(screen.getAllByRole('row')).toHaveLength(DATA.length + 1)
  })
})

// ---------------------------------------------------------------------------
// Row selection
// ---------------------------------------------------------------------------

describe('DataTable — row selection', () => {
  it('does not render selection checkboxes by default', () => {
    renderTable()
    // No "Select row" checkboxes — active cells only have "Active only" in advanced panel
    // The only checkboxes would be the boolean filter when open
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
})

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('DataTable — accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = renderTable()
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('has no axe violations with row selection enabled', async () => {
    const { container } = renderTable({ enableRowSelection: true })
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('has no axe violations with the advanced panel open', async () => {
    const user = userEvent.setup()
    const { container } = renderTable()
    await user.click(screen.getByRole('button', { name: /^Filters/ }))
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
