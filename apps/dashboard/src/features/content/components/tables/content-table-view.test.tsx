import { render, screen } from '@testing-library/react'
import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { rageProgressionTableFixture } from './progression-table-fixtures'
import { ContentTableView } from './content-table-view'

describe('ContentTableView', () => {
  it('renders progression tables with a Level axis', () => {
    render(<ContentTableView table={rageProgressionTableFixture} />)

    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Rages' })).toBeInTheDocument()
  })

  it('renders general tables without a Level axis', () => {
    render(<ContentTableView table={reincarnateSpeciesTableFixture} />)

    expect(screen.queryByRole('columnheader', { name: 'Level' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Species' })).toBeInTheDocument()
  })
})
