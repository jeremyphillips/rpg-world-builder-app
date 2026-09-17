import { render, screen } from '@testing-library/react'
import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { GeneralTableView } from './general-table-view'

describe('GeneralTableView', () => {
  it('renders without a Level row-header axis', () => {
    render(<GeneralTableView table={reincarnateSpeciesTableFixture} />)

    expect(screen.queryByRole('columnheader', { name: 'Level' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '1d10' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Species' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Dragonborn' })).toBeInTheDocument()
  })
})
