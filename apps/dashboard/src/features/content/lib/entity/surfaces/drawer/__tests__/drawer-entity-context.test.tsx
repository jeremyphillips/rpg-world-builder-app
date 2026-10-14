import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NumberStepper } from '@rpg/ui'

import { DrawerEntityContext } from '../drawer-entity-context'

describe('DrawerEntityContext', () => {
  it('renders heading, metadata, and trailing utility', () => {
    render(
      <DrawerEntityContext
        heading="Shortsword"
        metadata={['Simple', 'Melee']}
        fallback="equipment"
        trailing={
          <NumberStepper
            size="sm"
            value={1}
            min={1}
            onChange={() => undefined}
            aria-label="Quantity"
          />
        }
      />,
    )

    expect(screen.getByText('Shortsword')).toBeInTheDocument()
    const description = document.querySelector('[data-entity-item-slot="description"]')
    expect(description).toHaveTextContent('Simple')
    expect(description).toHaveTextContent('Melee')
    expect(description?.querySelector('[data-inline-metadata-separator]')).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeInTheDocument()
  })
})
