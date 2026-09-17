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

    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '9' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
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
