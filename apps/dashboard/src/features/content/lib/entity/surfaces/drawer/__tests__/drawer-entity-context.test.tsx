import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NumberStepper } from '@rpg/ui'
import { resolveContentDisplayFallback } from '@rpg/contracts'

import { buildEquipmentEntitySurfaceIdentity } from '../../../../../equipment/lib/equipment-entity-surface-identity.lib'
import { DrawerEntityContext } from '../drawer-entity-context'

describe('DrawerEntityContext', () => {
  it('renders projected identity, metadata segments, and trailing utility', () => {
    render(
      <DrawerEntityContext
        surface={{
          identity: buildEquipmentEntitySurfaceIdentity({
            heading: 'Shortsword',
            metadataSegments: ['Simple', 'Melee'],
            displayImage: undefined,
          }),
        }}
        trailing={{
          kind: 'utility',
          content: (
            <NumberStepper
              size="sm"
              value={1}
              min={1}
              onChange={() => undefined}
              aria-label="Quantity"
            />
          ),
        }}
      />,
    )

    expect(screen.getByText('Shortsword')).toBeInTheDocument()
    const description = document.querySelector('[data-entity-item-slot="description"]')
    expect(description).toHaveTextContent('Simple')
    expect(description).toHaveTextContent('Melee')
    expect(description?.querySelector('[data-inline-metadata-separator]')).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeInTheDocument()
  })

  it('places media in a stretch cell beside the content stack', () => {
    render(
      <DrawerEntityContext
        surface={{
          identity: buildEquipmentEntitySurfaceIdentity({
            heading: 'Shortsword',
            metadataSegments: ['Simple', 'Melee'],
            displayImage: undefined,
          }),
        }}
      />,
    )

    const mediaCell = document.querySelector('[data-entity-item-slot="media"]')
    expect(mediaCell?.getAttribute('data-row-anatomy-slot')).toBe('stretch')
  })

  it('renders heading-only identity without a meta cell', () => {
    render(
      <DrawerEntityContext
        surface={{
          identity: {
            heading: 'Amulet',
            fallback: resolveContentDisplayFallback({
              domain: 'equipment',
              surface: 'compact',
            }),
          },
        }}
      />,
    )

    expect(screen.getByText('Amulet')).toBeInTheDocument()
    expect(document.querySelector('[data-entity-item-slot="description"]')).toBeNull()
  })
})
