import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import {
  guildhallBuilding,
  testSettlementLocation,
} from '@/features/content/lib/fixtures/location-test-helpers'
import { makeLocation } from '@/test/fixtures/factories/location'
import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'

import { buildLocationsById } from '../lib/location-display'
import { CITY_COUNCIL, SILVER_CIRCLE } from '../../organizations/fixtures'
import {
  LOCATION_INVERSE_ORGANIZATION_DRAWER,
  TERRITORIAL_AUTHORITY_DRAWER,
} from '../lib/connected-parties/location-connection-surface-copy'
import { LocationInverseOrganizationConnectionLinkDrawer } from './location-inverse-organization-connection-link-drawer.client'

function infrastructureLocation() {
  return makeLocation({
    kind: 'structure',
    id: 'infrastructure-1',
    name: 'City Waterworks',
    slug: 'city-waterworks',
    structureType: 'infrastructure',
  })
}

const organizations = [CITY_COUNCIL]

function drawerContextFor(location: Parameters<typeof buildLocationsById>[0][number]) {
  return {
    locationsById: buildLocationsById([location]),
    campaignId: STORY_CAMPAIGN_ID,
  }
}

const headquartersRow = {
  relationshipId: 'rel-hq',
  subjectType: 'organization' as const,
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
    const location = testSettlementLocation()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        addKind="headquarters"
        location={location}
        {...drawerContextFor(location)}
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
    const location = guildhallBuilding()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        addKind="owns"
        location={location}
        {...drawerContextFor(location)}
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
    const location = guildhallBuilding()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeKind"
        intent="site"
        location={location}
        {...drawerContextFor(location)}
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
    expect(screen.getByText('Guildhall')).toBeInTheDocument()
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
    entity: {
      heading: CITY_COUNCIL.name,
      headingSuffix: ' · Government',
    },
    imageKey: CITY_COUNCIL.imageKey,
  }

  it('uses site-family replace copy without territorial drawer strings', () => {
    const location = guildhallBuilding()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="site"
        location={location}
        {...drawerContextFor(location)}
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

    expect(
      screen.getByRole('dialog', { name: LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceTitle }),
    ).toBeInTheDocument()
    expect(screen.getByText(LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceHelper)).toBeInTheDocument()
    expect(screen.getByText('Guildhall')).toBeInTheDocument()
    expect(screen.getByText('Headquarters of')).toBeInTheDocument()
    expect(
      screen.queryByText(TERRITORIAL_AUTHORITY_DRAWER.organizationNoResults),
    ).not.toBeInTheDocument()
  })

  it('uses territorial replace copy for territorial authority intent', () => {
    const location = testSettlementLocation()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="territorial_authority"
        location={location}
        {...drawerContextFor(location)}
        organizations={[CITY_COUNCIL, SILVER_CIRCLE]}
        connectedPartyRows={[
          {
            ...headquartersRow,
            kind: 'governs',
            label: 'Governs',
            family: 'territorial_authority',
            sectionGroup: 'territorial_authority',
          },
        ]}
        initialConnection={{
          relationshipId: 'rel-governs',
          organizationId: CITY_COUNCIL.id,
          kind: 'governs',
        }}
        currentEndpoint={currentOrganizationEndpoint}
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: TERRITORIAL_AUTHORITY_DRAWER.replaceTitle }),
    ).toBeInTheDocument()
    expect(screen.getByText(TERRITORIAL_AUTHORITY_DRAWER.replaceHelper)).toBeInTheDocument()
    expect(screen.getByText('Port City')).toBeInTheDocument()
    expect(screen.getByText('Settlement · City')).toBeInTheDocument()
  })

  it('shows current and new organization fields with replacement picker', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const location = guildhallBuilding()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="site"
        location={location}
        {...drawerContextFor(location)}
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
    expect(screen.getByText('Current organization')).toBeInTheDocument()
    expect(screen.getByText('New organization')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Relationship type' })).not.toBeInTheDocument()
    expect(screen.getByText('Relationship type')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search organizations…')).toBeInTheDocument()
    expect(screen.getAllByText('City Council')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Replace organization' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Select' }))

    expect(screen.getAllByText('City Council')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Replace organization' })).toBeEnabled()
  })

  it('shows read-only relationship type and organization picker without kind controls', () => {
    const location = guildhallBuilding()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="site"
        location={location}
        {...drawerContextFor(location)}
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
    expect(screen.getByText('Headquarters of')).toBeInTheDocument()
  })

  it('evaluates replace-organization availability for the persisted kind, not site-family union', () => {
    const location = infrastructureLocation()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="replaceOrganization"
        intent="site"
        location={location}
        {...drawerContextFor(location)}
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

describe('LocationInverseOrganizationConnectionLinkDrawer nested create', () => {
  it('preserves the organization picker and blocks relationship actions while nested create is active', async () => {
    const user = userEvent.setup()
    const location = guildhallBuilding()

    renderWithProviders(
      <LocationInverseOrganizationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        addKind="headquarters"
        location={location}
        {...drawerContextFor(location)}
        organizations={[CITY_COUNCIL, SILVER_CIRCLE]}
        connectedPartyRows={[]}
        onSubmit={vi.fn()}
      />,
    )

    const search = screen.getByRole('textbox', { name: 'Search organizations…' })
    await user.type(search, 'City')
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create organization' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create organization' }))

    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Search organizations…', hidden: true }),
    ).toHaveValue('City')
    expect(
      screen.getByRole('button', { name: 'Add headquarters organization', hidden: true }),
    ).toBeDisabled()
  })
})
