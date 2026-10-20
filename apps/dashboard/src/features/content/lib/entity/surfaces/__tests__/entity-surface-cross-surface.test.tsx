import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { resolveContentDisplayFallback } from '@rpg/contracts'

import { buildEquipmentEntitySurfaceIdentity } from '../../../../equipment/lib/equipment-entity-surface-identity.lib'
import { projectEntitySurfaceConfig } from '../entity-surface-projection.lib'
import { EntityCard } from '../cards/content/entity-card'
import { DrawerEntityContext } from '../drawer/drawer-entity-context'

const WEAPON_SURFACE = {
  identity: buildEquipmentEntitySurfaceIdentity({
    heading: 'Shortsword',
    metadataSegments: ['Simple', 'Melee'],
    displayImage: undefined,
  }),
} as const

describe('entity surface cross-surface parity', () => {
  it('projects identical semantic identity for card and drawer shells', () => {
    const projected = projectEntitySurfaceConfig(WEAPON_SURFACE, 'compact')

    expect(projected.entity).toMatchObject({
      heading: 'Shortsword',
      supportingMetadata: ['Simple', 'Melee'],
    })
    expect(projected.entity.media).toBeTruthy()
  })

  it('renders matching identity semantics on card and drawer surfaces', () => {
    const { unmount: unmountCard } = render(
      <EntityCard density="compact" entity={projectEntitySurfaceConfig(WEAPON_SURFACE).entity} />,
    )

    expect(screen.getByText('Shortsword')).toBeInTheDocument()
    expect(screen.getByText('Simple')).toBeInTheDocument()
    expect(screen.getByText('Melee')).toBeInTheDocument()
    const cardMedia = document.querySelector('[data-entity-item-slot="media"]')
    expect(cardMedia?.getAttribute('data-row-anatomy-slot')).toBe('stretch')
    expect(cardMedia?.querySelector('.size-10')).toBeTruthy()
    unmountCard()

    render(<DrawerEntityContext surface={WEAPON_SURFACE} />)

    expect(screen.getByText('Shortsword')).toBeInTheDocument()
    expect(screen.getByText('Simple')).toBeInTheDocument()
    expect(screen.getByText('Melee')).toBeInTheDocument()
    const drawerMedia = document.querySelector('[data-entity-item-slot="media"]')
    expect(drawerMedia?.getAttribute('data-row-anatomy-slot')).toBe('stretch')
    expect(drawerMedia?.querySelector('.size-10')).toBeTruthy()
  })

  it('keeps organization domain on classification for drawer and card', () => {
    const surface = {
      identity: {
        heading: 'City Council',
        fallback: resolveContentDisplayFallback({
          domain: 'organization',
          surface: 'compact',
        }),
        classification: 'Government',
      },
    } as const

    const { unmount } = render(
      <EntityCard density="compact" entity={projectEntitySurfaceConfig(surface).entity} />,
    )
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(
      screen.queryByText('Government', { selector: '[data-entity-item-slot="description"] *' }),
    ).not.toBeInTheDocument()
    unmount()

    render(<DrawerEntityContext surface={surface} />)
    expect(screen.getByText('Government')).toBeInTheDocument()
  })
})
