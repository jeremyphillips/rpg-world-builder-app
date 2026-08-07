import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Location } from '@rpg/contracts'

import { CITY_COUNCIL, SILVER_CIRCLE } from '../../organizations/fixtures'
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

function infrastructureLocation(): Location {
  return {
    id: 'infrastructure-1',
    campaignId: 'camp-1',
    name: 'City Waterworks',
    slug: 'city-waterworks',
    kind: 'structure',
    structureType: 'infrastructure',
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

const headquartersRow = {
  relationshipId: 'rel-hq',
  subject: {
    type: 'organization' as const,
    id: CITY_COUNCIL.id,
    name: CITY_COUNCIL.name,
    slug: CITY_COUNCIL.slug,
  },
  kind: 'headquarters' as const,
  label: 'Headquarters',
  family: 'site' as const,
  priority: 60,
  sectionGroup: 'people_and_organizations' as const,
}

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

describe('LocationInverseOrganizationConnectionLinkDrawer change-kind', () => {
  it('opens with expanded kind choices, fixed organization, and no organization picker', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeKind"
        intent="site"
        location={buildingLocation()}
        organizations={organizations}
        connectedPartyRows={[headquartersRow]}
        initialConnection={{
          relationshipId: 'rel-hq',
          organizationId: CITY_COUNCIL.id,
          kind: 'headquarters',
        }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change connection type' })).toBeInTheDocument()
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.queryByText(/Current:/i)).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Relationship type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Headquarters/i })).toBeChecked()
    expect(screen.queryByPlaceholderText('Search organizations…')).not.toBeInTheDocument()
    expect(screen.queryByText('No organizations are available.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save change' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    expect(screen.getByRole('button', { name: 'Save change' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Save change' }))

    expect(onSubmit).toHaveBeenCalledWith({
      organizationId: CITY_COUNCIL.id,
      kind: 'owns',
    })
  })
})

describe('LocationInverseOrganizationConnectionLinkDrawer replace organization', () => {
  const currentOrganizationEndpoint = {
    heading: CITY_COUNCIL.name,
    subheading: 'Government',
    imageKey: CITY_COUNCIL.imageKey,
  }

  it('shows current and new organization fields with replacement picker', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="site"
        location={buildingLocation()}
        organizations={[CITY_COUNCIL, SILVER_CIRCLE]}
        connectedPartyRows={[headquartersRow]}
        initialConnection={{
          relationshipId: 'rel-hq',
          organizationId: CITY_COUNCIL.id,
          kind: 'headquarters',
        }}
        currentEndpoint={currentOrganizationEndpoint}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Replace organization' })).toBeInTheDocument()
    expect(screen.getByText('Relationship type')).toBeInTheDocument()
    expect(screen.getByText('Headquarters')).toBeInTheDocument()
    expect(screen.getByText('Current organization')).toBeInTheDocument()
    expect(screen.getByText('New organization')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Relationship type' })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search organizations…')).toBeInTheDocument()
    expect(screen.getAllByText('City Council')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Replace organization' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Select' }))

    expect(screen.getAllByText('City Council')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Replace organization' })).toBeEnabled()
  })

  it('shows read-only relationship type and organization picker without kind controls', () => {
    render(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="site"
        location={buildingLocation()}
        organizations={organizations}
        connectedPartyRows={[headquartersRow]}
        initialConnection={{
          relationshipId: 'rel-hq',
          organizationId: CITY_COUNCIL.id,
          kind: 'headquarters',
        }}
        currentEndpoint={currentOrganizationEndpoint}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('City Council')).toBeInTheDocument()
  })

  it('evaluates replace-organization availability for the persisted kind, not site-family union', () => {
    render(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="site"
        location={infrastructureLocation()}
        organizations={[CITY_COUNCIL, SILVER_CIRCLE]}
        connectedPartyRows={[headquartersRow]}
        initialConnection={{
          relationshipId: 'rel-hq',
          organizationId: CITY_COUNCIL.id,
          kind: 'headquarters',
        }}
        currentEndpoint={currentOrganizationEndpoint}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled()
  })
})
