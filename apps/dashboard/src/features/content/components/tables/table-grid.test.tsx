import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { TableGridPresentation } from './table-grid-presentation'
import { TableGrid } from './table-grid'

const samplePresentation: TableGridPresentation = {
  columns: [
    { key: 'uses', label: 'Uses' },
    { key: 'damage', label: 'Damage' },
  ],
  rows: [
    { rowHeader: 1, cells: { uses: '2', damage: '+2' } },
    { rowHeader: 9, cells: { uses: '4', damage: '+3' } },
  ],
}

describe('TableGrid', () => {
  it('renders no leading row-header column when rowHeaderLabel is omitted', () => {
    render(<TableGrid presentation={samplePresentation} />)

    expect(screen.queryByRole('columnheader', { name: 'Level' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Uses' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
  })

  it('does not render a leading row-header column when rowHeaderLabel is explicitly undefined', () => {
    render(<TableGrid presentation={samplePresentation} rowHeaderLabel={undefined} />)

    expect(screen.queryByRole('columnheader', { name: 'Level' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
  })

  it('renders a leading row-header column when rowHeaderLabel is set', () => {
    render(<TableGrid presentation={samplePresentation} rowHeaderLabel="Level" />)

    const levelHeader = screen.getByRole('columnheader', { name: 'Level' })
    expect(levelHeader).toBeInTheDocument()
    expect(levelHeader.className).toMatch(/sticky/)
    expect(screen.getByRole('rowheader', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: '9' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
  })

  it('renders an embedded table without the Table scroll wrapper', () => {
    const { container } = render(
      <TableGrid presentation={samplePresentation} rowHeaderLabel="Level" scrollMode="embedded" />,
    )

    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('[class*="overflow-auto"] table')).toBeNull()
  })

  it('renders a centered empty-body message when rows are absent', () => {
    render(
      <TableGrid
        presentation={{
          columns: [{ key: 'effect', label: 'Column 1' }],
          rows: [],
        }}
        rowHeaderLabel="Level"
        emptyBodyMessage="No rows yet."
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Column 1' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'No rows yet.' })).toBeInTheDocument()
  })

  it('renders tier separator rows in progression previews', () => {
    render(
      <TableGrid
        presentation={{
          columns: [{ key: 'xp', label: 'XP required' }],
          rows: [
            { rowHeader: 20, cells: { xp: '355,000' } },
            { kind: 'tierSeparator', label: 'Epic Destiny Tier' },
            { rowHeader: 21, cells: { xp: '405,000' } },
          ],
        }}
        rowHeaderLabel="Level"
      />,
    )

    expect(screen.getByText('Epic Destiny Tier')).toBeInTheDocument()
  })

  it('renders em dashes for missing cell values', () => {
    render(
      <TableGrid
        presentation={{
          columns: [{ key: 'uses', label: 'Uses' }],
          rows: [{ rowHeader: 1, cells: {} }],
        }}
        rowHeaderLabel="Level"
      />,
    )

    expect(screen.getAllByRole('cell', { name: '—' })).toHaveLength(1)
  })
})
