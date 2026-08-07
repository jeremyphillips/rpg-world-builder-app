import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { Location, Organization } from '@rpg/contracts'

import {
  DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION,
  resolveOrganizationForwardTargetPresentation,
} from '../lib/organization-location-connection-surface-copy'
import {
  OrganizationLocationConnectionLinkDrawer,
  ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE,
  ORGANIZATION_LOCATION_LINK_NO_RESULTS,
} from './organization-location-connection-link-drawer.client'
import { RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES } from '../../lib/relationship/relationship-alternatives'
import { RELATIONSHIP_DRAWER_CURRENT_ENDPOINT_UNAVAILABLE_MESSAGE } from '../../lib/relationship/relationship-drawer-current-entity'

const organization: Pick<Organization, 'name' | 'organizationKind'> = {
  name: 'The Monarchy',
  organizationKind: 'government',
}

function buildingLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'building-1',
    campaignId: 'camp-1',
    name: 'Royal Mint',
    slug: 'royal-mint',
    kind: 'structure',
    structureType: 'building',
    ...overrides,
  } as Location
}

function regionLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'region-1',
    campaignId: 'camp-1',
    name: 'Northern March',
    slug: 'northern-march',
    kind: 'region',
    ...overrides,
  } as Location
}

function settlementLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'settlement-1',
    campaignId: 'camp-1',
    name: 'Port City',
    slug: 'port-city',
    kind: 'settlement',
    ...overrides,
  } as Location
}

function districtLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'district-1',
    campaignId: 'camp-1',
    name: 'Harbor Ward',
    slug: 'harbor-ward',
    kind: 'district',
    ...overrides,
  } as Location
}

describe('OrganizationLocationConnectionLinkDrawer', () => {
  it('opens with collapsible kind cards and canonical descriptions for site family add', async () => {
    const user = userEvent.setup()

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[buildingLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('The Monarchy · Government')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Connect this organization to a specific site or facility it owns, occupies, operates, or uses as headquarters/i,
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Relationship type' })).toBeInTheDocument()
    expect(screen.getByText(/Owns or holds title to a property or site/i)).toBeInTheDocument()
    expect(screen.getByText(ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Owner/i }))

    expect(screen.getByRole('heading', { name: 'Owner' })).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Relationship type' })).not.toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
  })

  it('shows a disabled headquarters option with the existing location reason in add site relationship', () => {
    const guildhouse = buildingLocation({ id: 'building-hq', name: 'Thieves Guildhouse' })

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[guildhouse, buildingLocation({ id: 'building-2', name: 'The Silver Eel' })]}
        existingConnections={[{ id: 'conn-hq', locationId: guildhouse.id, kind: 'headquarters' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: /Headquarters/i })).toBeDisabled()
    expect(screen.getByText('Already set at Thieves Guildhouse.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'A designated primary base or headquarters location for the organization.',
      ),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Owner/i })).toBeEnabled()
  })

  it('skips kind UI for geographic presence and shows the location picker immediately', () => {
    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organization={organization}
        organizationId="org-1"
        locations={[regionLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('radiogroup', {
        name: /Connection type|Relationship type|Authority type/i,
      }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Location type' })).toBeInTheDocument()
    expect(
      screen.getByText('Choose a settlement or region where this organization is present.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Settlements' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regions' })).toBeInTheDocument()
    expect(screen.getByText('Northern March')).toBeInTheDocument()
  })

  it('filters geographic presence locations by settlement and region segments', async () => {
    const user = userEvent.setup()

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organization={organization}
        organizationId="org-1"
        locations={[regionLocation(), settlementLocation(), districtLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Northern March')).toBeInTheDocument()
    expect(screen.getByText('Port City')).toBeInTheDocument()
    expect(screen.getByText('Harbor Ward')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Settlements' }))

    expect(screen.queryByText('Northern March')).not.toBeInTheDocument()
    expect(screen.getByText('Port City')).toBeInTheDocument()
    expect(screen.getByText('Harbor Ward')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Regions' }))

    expect(screen.getByText('Northern March')).toBeInTheDocument()
    expect(screen.queryByText('Port City')).not.toBeInTheDocument()
    expect(screen.queryByText('Harbor Ward')).not.toBeInTheDocument()
  })

  it('preserves search query when switching geographic presence browse scopes', async () => {
    const user = userEvent.setup()

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organization={organization}
        organizationId="org-1"
        locations={[regionLocation(), settlementLocation(), districtLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    const searchInput = screen.getByRole('textbox', {
      name: DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION.searchPlaceholder,
    })
    await user.type(searchInput, 'Port')
    expect(searchInput).toHaveValue('Port')

    await user.click(screen.getByRole('button', { name: 'Settlements' }))
    expect(searchInput).toHaveValue('Port')

    await user.click(screen.getByRole('button', { name: 'Regions' }))
    expect(searchInput).toHaveValue('Port')
  })

  it('disables settlement browse scope when no eligible settlement candidates exist', () => {
    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organization={organization}
        organizationId="org-1"
        locations={[regionLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'All' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Settlements' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Regions' })).toBeEnabled()
  })

  it('disables territorial singleton locations occupied by another organization', async () => {
    const user = userEvent.setup()

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="territorial_authority"
        organization={organization}
        organizationId="org-1"
        locations={[regionLocation()]}
        existingConnections={[]}
        edgesByLocationId={{
          'region-1': [
            {
              organizationId: 'org-other',
              connectionId: 'conn-other',
              locationId: 'region-1',
              kind: 'governs',
              subjectName: 'Other Realm',
            },
          ],
        }}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Controls/i }))

    expect(screen.getByText('Northern March')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
  })

  it('preserves a compatible selected location when changing kind', async () => {
    const user = userEvent.setup()

    function ControlledDrawer() {
      const [open, setOpen] = useState(true)

      return (
        <OrganizationLocationConnectionLinkDrawer
          open={open}
          onOpenChange={setOpen}
          mode="add"
          intent="site"
          organization={organization}
          organizationId="org-1"
          locations={[buildingLocation()]}
          existingConnections={[]}
          edgesByLocationId={{}}
          occupancyLoaded
          onSubmit={vi.fn()}
        />
      )
    }

    render(<ControlledDrawer />)

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('opens change-kind with expanded relationship type and fixed location', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeKind"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[buildingLocation()]}
        existingConnections={[{ id: 'conn-1', locationId: 'building-1', kind: 'headquarters' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-1', locationId: 'building-1', kind: 'headquarters' }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change connection type' })).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
    expect(screen.queryByText(/Current:/i)).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Relationship type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Headquarters/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Owner/i })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Search structures…' })).not.toBeInTheDocument()
    expect(screen.queryByText('No locations are available.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Select' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save change' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    expect(screen.getByRole('button', { name: 'Save change' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Save change' }))

    expect(onSubmit).toHaveBeenCalledWith({
      locationId: 'building-1',
      kind: 'owns',
    })
  })

  it('clears an incompatible selected location when changing kind', async () => {
    const user = userEvent.setup()

    const infrastructureLocation = {
      ...buildingLocation(),
      id: 'infrastructure-1',
      name: 'City Waterworks',
      slug: 'city-waterworks',
      structureType: 'infrastructure',
    } as Location

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[infrastructureLocation, buildingLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(
      within(screen.getByText('City Waterworks').closest('article')!).getByRole('button', {
        name: 'Select',
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))

    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
    expect(screen.queryByText('City Waterworks')).not.toBeInTheDocument()
  })

  it('shows current and new location fields for headquarters changeTarget', async () => {
    const user = userEvent.setup()
    const guildhouse = buildingLocation({ id: 'building-hq', name: 'Thieves Guildhouse' })
    const silverEel = buildingLocation({
      id: 'building-2',
      name: 'The Silver Eel',
      slug: 'silver-eel',
    })
    const headquartersPresentation = resolveOrganizationForwardTargetPresentation('headquarters')
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[guildhouse, settlementLocation(), silverEel]}
        existingConnections={[{ id: 'conn-hq', locationId: guildhouse.id, kind: 'headquarters' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-hq', locationId: guildhouse.id, kind: 'headquarters' }}
        currentEndpoint={{
          heading: 'Thieves Guildhouse',
          subheading: 'Structure',
        }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change headquarters location' })).toBeInTheDocument()
    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText('New location')).toBeInTheDocument()
    expect(screen.getByText('Thieves Guildhouse')).toBeInTheDocument()
    expect(screen.getAllByText('Structure').length).toBeGreaterThan(0)
    expect(screen.getByText(headquartersPresentation.targetHelp!)).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: headquartersPresentation.searchPlaceholder }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Location type' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Thieves Guildhouse')).toHaveLength(1)
    expect(screen.getByText('The Silver Eel')).toBeInTheDocument()
    expect(screen.queryByText('Port City')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save change' })).toBeDisabled()

    await user.click(
      within(screen.getByText('The Silver Eel').closest('article')!).getByRole('button', {
        name: 'Select',
      }),
    )

    expect(screen.getAllByText('Thieves Guildhouse')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Save change' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Save change' }))
    expect(onSubmit).toHaveBeenCalledWith({
      locationId: silverEel.id,
      kind: 'headquarters',
    })
  })

  it('shows stale current location even when it is not an eligible replacement', () => {
    const staleSettlement = settlementLocation({ id: 'settlement-hq', name: 'Legacy Port HQ' })
    const silverEel = buildingLocation({
      id: 'building-2',
      name: 'The Silver Eel',
      slug: 'silver-eel',
    })

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[silverEel]}
        existingConnections={[
          { id: 'conn-hq', locationId: staleSettlement.id, kind: 'headquarters' },
        ]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{
          id: 'conn-hq',
          locationId: staleSettlement.id,
          kind: 'headquarters',
        }}
        currentEndpoint={{
          heading: 'Legacy Port HQ',
          subheading: 'Settlement',
        }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText('Legacy Port HQ')).toBeInTheDocument()
    expect(screen.getByText('Settlement')).toBeInTheDocument()
    expect(screen.getByText('The Silver Eel')).toBeInTheDocument()
  })

  it('blocks changeTarget when the current endpoint is unavailable', () => {
    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[buildingLocation()]}
        existingConnections={[{ id: 'conn-hq', locationId: 'missing-loc', kind: 'headquarters' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-hq', locationId: 'missing-loc', kind: 'headquarters' }}
        currentEndpoint={{
          heading: 'Unavailable location',
          unavailable: true,
        }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText('Unavailable location')).toBeInTheDocument()
    expect(
      screen.getByText(RELATIONSHIP_DRAWER_CURRENT_ENDPOINT_UNAVAILABLE_MESSAGE),
    ).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search structures…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save change' })).not.toBeInTheDocument()
  })

  it('excludes settlements from headquarters add picker', async () => {
    const user = userEvent.setup()
    const silverEel = buildingLocation({
      id: 'building-2',
      name: 'The Silver Eel',
      slug: 'silver-eel',
    })

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[settlementLocation(), silverEel]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))

    expect(screen.getByText('Choose a structure for this headquarters.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search structures…' })).toBeInTheDocument()
    expect(screen.getByText('The Silver Eel')).toBeInTheDocument()
    expect(screen.queryByText('Port City')).not.toBeInTheDocument()
  })

  it('shows search-empty messaging without disabling the selected kind', async () => {
    const user = userEvent.setup()

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[buildingLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.type(
      screen.getByRole('textbox', {
        name: DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION.searchPlaceholder,
      }),
      'zzzz-no-match',
    )

    expect(screen.getByText(ORGANIZATION_LOCATION_LINK_NO_RESULTS)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Owner' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations in kind summary mode', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[buildingLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await expectNoAxeViolations(container)
  })

  it('does not show authoritative-empty for changeTarget when candidate set is partial', () => {
    const current = regionLocation()

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="geographic_presence"
        organization={organization}
        organizationId="org-1"
        locations={[current]}
        locationCandidates={{ items: [current], isAuthoritativeDomainSet: false }}
        existingConnections={[{ id: 'conn-1', locationId: current.id, kind: 'operates_in' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-1', locationId: current.id, kind: 'operates_in' }}
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.queryByText(RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES.changeTarget),
    ).not.toBeInTheDocument()
  })
})
