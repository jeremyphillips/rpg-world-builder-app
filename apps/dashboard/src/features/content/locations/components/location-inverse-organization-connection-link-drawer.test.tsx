import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Location } from '@rpg/contracts'

import { CITY_COUNCIL } from '../../organizations/fixtures'
import { LocationInverseOrganizationConnectionLinkDrawer } from './location-inverse-organization-connection-link-drawer.client'

function settlementLocation(): Location {
  return {
    id: 'settlement-1',
    campaignId: 'camp-1',
    name: 'Port City',
    slug: 'port-city',
    kind: 'settlement',
  } as Location
}

function buildingLocation(): Location {
  return {
    id: 'building-1',
    campaignId: 'camp-1',
    name: 'Guildhall',
    slug: 'guildhall',
    kind: 'structure',
    structureType: 'building',
  } as Location
}

const organizations = [CITY_COUNCIL]

describe('LocationInverseOrganizationConnectionLinkDrawer direct-intent regression', () => {
  it('does not show a broad family kind selector for Add headquarters', () => {
    render(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        addKind="headquarters"
        location={settlementLocation()}
        organizations={organizations}
        connectedPartyRows={[]}
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('radiogroup', { name: /Relationship type|Connection type/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Add headquarters organization' }),
    ).toBeInTheDocument()
  })

  it('does not show a broad family kind selector for Add owner on a building', () => {
    render(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        addKind="owns"
        location={buildingLocation()}
        organizations={organizations}
        connectedPartyRows={[]}
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('radiogroup', { name: /Relationship type|Connection type/i }),
    ).not.toBeInTheDocument()
  })
})
