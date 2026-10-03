import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RowAnatomyCell } from './row-anatomy-cell'

describe('RowAnatomyCell', () => {
  it('places by host column line name and publishes measurement attributes', () => {
    render(
      <RowAnatomyCell cell={{ slot: 'band', column: 'trailing' }} data-testid="cell">
        Add
      </RowAnatomyCell>,
    )

    const cell = screen.getByTestId('cell')
    expect(cell).toHaveAttribute('data-row-anatomy-slot', 'band')
    expect(cell).toHaveAttribute('data-row-anatomy-column', 'trailing')
    expect(cell.style.gridColumn).toBe('trailing')
    expect(cell).toHaveClass('row-start-[band]', 'self-center')
  })

  it('forwards host data attributes without overriding slot attributes', () => {
    render(
      <RowAnatomyCell
        cell={{ slot: 'meta', column: 'content' }}
        data-entity-item-slot="description"
        data-row-anatomy-slot="band"
      >
        Supporting
      </RowAnatomyCell>,
    )

    const cell = screen.getByText('Supporting')
    expect(cell).toHaveAttribute('data-entity-item-slot', 'description')
    expect(cell).toHaveAttribute('data-row-anatomy-slot', 'meta')
  })
})
