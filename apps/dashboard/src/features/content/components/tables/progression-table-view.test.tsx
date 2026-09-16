import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { ProgressionTableGrid } from './progression-table-grid'
import { ProgressionTableView } from './progression-table-view'
import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from './progression-table-fixtures'

describe('ProgressionTableView', () => {
  it('renders formatted rage progression values', () => {
    render(<ProgressionTableView table={rageProgressionTableFixture} />)

    expect(screen.getByRole('columnheader', { name: 'Rages' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Rage Damage' })).toBeInTheDocument()
    expect(screen.getAllByRole('cell', { name: '+2' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('cell', { name: '+3' })).toBeInTheDocument()
  })

  it('renders dice columns as formatted dice expressions', () => {
    render(<ProgressionTableView table={martialArtsProgressionTableFixture} />)

    expect(screen.getByRole('cell', { name: '1d6' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1d8' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1d10' })).toBeInTheDocument()
  })

  it('renders mixed number, dice, and text columns', () => {
    render(<ProgressionTableView table={mixedProgressionTableFixture} />)

    expect(screen.getByRole('cell', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1d6' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Special' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<ProgressionTableView table={rageProgressionTableFixture} />)
    await expectNoAxeViolations(container)
  })
})

describe('ProgressionTableGrid', () => {
  it('renders em dashes for missing values without throwing', () => {
    render(
      <ProgressionTableGrid
        presentation={{
          columns: [{ key: 'uses', label: 'Uses' }],
          rows: [{ level: 1, values: {} }],
        }}
      />,
    )

    expect(screen.getByRole('cell', { name: '—' })).toBeInTheDocument()
  })

  it('renders partial presentation data without throwing', () => {
    render(
      <ProgressionTableGrid
        presentation={{
          columns: [{ key: 'uses' }],
          rows: [{ values: { uses: '2' } }],
        }}
      />,
    )

    expect(screen.getByRole('cell', { name: '2' })).toBeInTheDocument()
    expect(screen.getAllByRole('cell', { name: '—' })).toHaveLength(1)
  })
})
