import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import {
  progressionDraftToGridPresentation,
  tableToDraft,
} from '../../lib/table-builder/table-builder-draft'
import { ProgressionTableView } from './progression-table-view'
import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from './progression-table-fixtures'

describe('ProgressionTableView', () => {
  it('renders a Level row-header axis', () => {
    render(<ProgressionTableView table={rageProgressionTableFixture} />)

    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()
  })

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

  it('matches progressionDraftToGridPresentation parity for a valid persisted table', () => {
    const draft = tableToDraft(rageProgressionTableFixture)
    const draftPresentation = progressionDraftToGridPresentation(draft)

    render(<ProgressionTableView table={rageProgressionTableFixture} />)

    for (const row of draftPresentation.rows) {
      for (const column of draftPresentation.columns) {
        const value = row.cells[column.key]
        if (value === undefined) continue
        expect(screen.getAllByRole('cell', { name: String(value) }).length).toBeGreaterThan(0)
      }
    }
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<ProgressionTableView table={rageProgressionTableFixture} />)
    await expectNoAxeViolations(container)
  })
})
