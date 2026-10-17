import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CardSurfaceToneProvider } from './card-surface-tone.client'
import { cardSurfaceVariants } from './card.variants'

describe('CardSurfaceToneProvider inheritHostPlane', () => {
  it('publishes quiet fill override on the host wrapper', () => {
    render(
      <CardSurfaceToneProvider tone="quiet" inheritHostPlane>
        <div data-testid="host" className={cardSurfaceVariants({ tone: 'quiet' })}>
          Row
        </div>
      </CardSurfaceToneProvider>,
    )

    const host = screen.getByTestId('host').parentElement
    expect(host).toHaveClass('ui-card-tone-host--inherit')
    expect(screen.getByTestId('host')).toHaveClass('ui-card--quiet')
  })
})
