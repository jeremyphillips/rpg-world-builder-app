import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DetailEntityRowActions } from '../detail-entity-row-actions'

describe('DetailEntityRowActions', () => {
  it('renders children in order without altering their roles', () => {
    render(
      <DetailEntityRowActions>
        <button type="button">Utility</button>
        <button type="button">Overflow</button>
      </DetailEntityRowActions>,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual(['Utility', 'Overflow'])
  })

  it('applies the shared layout contract', () => {
    const { container } = render(
      <DetailEntityRowActions>
        <button type="button">Only</button>
      </DetailEntityRowActions>,
    )

    expect(container.firstChild).toHaveClass('flex', 'shrink-0', 'items-center', 'gap-0.5')
  })
})
