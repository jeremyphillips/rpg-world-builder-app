import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { buildCharacterEntityCardModel } from '@/features/character/lib/display/character-entity-summary.lib'

import { YAWNING_PORTAL, LOCATIONS_LIST } from '../../../../locations/fixtures'
import { CITY_COUNCIL } from '../../../../organizations/fixtures'
import {
  buildLocationEntityCardModel,
  buildLocationsById,
  buildLocationEntitySummaryVm,
} from '../../../../locations/lib/location-display'
import {
  buildOrganizationEntityCardModel,
  buildOrganizationEntitySummaryVm,
} from '../../../../organizations/lib/organization-display'
import { CatalogEntitySurfaceRow } from '../catalog/catalog-entity-surface-row'

const characterVm = {
  id: 'char-1',
  name: 'Brock',
  characterType: { value: 'npc' as const, label: 'NPC' },
  identitySummary: 'Dwarf · Level 1 Rogue',
}

describe('entity surface renderer contract', () => {
  it('renders character member and connection configs through one row surface', () => {
    const { rerender } = render(
      <CatalogEntitySurfaceRow
        toolbarLabel="Brock"
        domIds={{ itemId: 'a', titleId: 'a-title', bodyId: 'a-body' }}
        collapsible
        collapsed={false}
        onToggleCollapse={() => undefined}
        surface={{
          identity: buildCharacterEntityCardModel(characterVm, {
            includeCharacterTypeInMetadata: true,
            status: [{ kind: 'badge', label: 'Recommended', tone: 'info' }],
          }),
          inlineAction: { label: 'Add', onClick: () => undefined },
          details: <p>Membership details</p>,
        }}
      />,
    )

    expect(screen.getByText('NPC · Dwarf · Level 1 Rogue')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByText('Recommended')).toBeInTheDocument()

    rerender(
      <CatalogEntitySurfaceRow
        toolbarLabel="Brock"
        domIds={{ itemId: 'b', titleId: 'b-title', bodyId: 'b-body' }}
        collapsible={false}
        collapsed={false}
        onToggleCollapse={() => undefined}
        surface={{
          identity: buildCharacterEntityCardModel(characterVm, {
            includeCharacterTypeInMetadata: true,
          }),
          inlineAction: { label: 'Select', onClick: () => undefined },
        }}
      />,
    )

    expect(screen.getByText('NPC · Dwarf · Level 1 Rogue')).toBeInTheDocument()
    expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('renders location projector output with classification and without inline action', () => {
    const locationsById = buildLocationsById(LOCATIONS_LIST)
    const summary = buildLocationEntitySummaryVm(YAWNING_PORTAL, {
      locationsById,
      campaignId: 'camp-1',
    })

    render(
      <CatalogEntitySurfaceRow
        toolbarLabel="Yawning Portal"
        domIds={{ itemId: 'loc', titleId: 'loc-title', bodyId: 'loc-body' }}
        collapsible={false}
        collapsed={false}
        onToggleCollapse={() => undefined}
        surface={{ identity: buildLocationEntityCardModel(summary) }}
      />,
    )

    expect(screen.getByText('Yawning Portal')).toBeInTheDocument()
    expect(screen.getByText('Building · Brewery')).toBeInTheDocument()
    expect(screen.getByText('Located in Dock Ward')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders organization projector output with domain classification and compact select', () => {
    render(
      <CatalogEntitySurfaceRow
        toolbarLabel="City Council"
        domIds={{ itemId: 'org', titleId: 'org-title', bodyId: 'org-body' }}
        collapsible={false}
        collapsed={false}
        onToggleCollapse={() => undefined}
        surface={{
          identity: buildOrganizationEntityCardModel(
            buildOrganizationEntitySummaryVm(CITY_COUNCIL),
          ),
          inlineAction: { label: 'Select', onClick: () => undefined },
        }}
      />,
    )

    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })
})
