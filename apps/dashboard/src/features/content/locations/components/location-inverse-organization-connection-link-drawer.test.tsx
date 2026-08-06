import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('LocationInverseOrganizationConnectionLinkDrawer change-kind edit', () => {
  it('opens with collapsed kind summary and structured organization field', async () => {
    const user = userEvent.setup()

    render(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeKind"
        intent="site"
        location={buildingLocation()}
        organizations={organizations}
        connectedPartyRows={[
          {
            relationshipId: 'rel-hq',
            subject: {
              type: 'organization',
              id: CITY_COUNCIL.id,
              name: CITY_COUNCIL.name,
              slug: CITY_COUNCIL.slug,
            },
            kind: 'headquarters',
            label: 'Headquarters',
            family: 'site',
            priority: 60,
            sectionGroup: 'people_and_organizations',
          },
        ]}
        initialConnection={{
          relationshipId: 'rel-hq',
          organizationId: CITY_COUNCIL.id,
          kind: 'headquarters',
        }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change connection type' })).toBeInTheDocument()
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.queryByText(/Current:/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Headquarters' })).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Relationship type' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change connection type' }))
    expect(screen.getByRole('radiogroup', { name: 'Relationship type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Headquarters/i })).toBeChecked()
  })
})
