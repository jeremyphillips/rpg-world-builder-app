import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import {
  northernMarchRegion,
  testBuildingLocation,
  testDistrictLocation,
  testSettlementLocation,
} from '@/features/content/lib/fixtures/location-test-helpers'
import { makeLocation } from '@/test/fixtures/factories/location'
import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'

import {
  DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION,
  resolveOrganizationForwardTargetPresentation,
} from '../../lib/location-connections/organization-location-connection-surface-copy'
import {
  OrganizationLocationConnectionLinkDrawer,
  ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE,
  ORGANIZATION_LOCATION_LINK_NO_RESULTS,
} from './organization-location-connection-link-drawer.client'
import { RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES } from '../../../lib/relationship/list/relationship-alternatives'
import { ENTITY_REPLACEMENT_CURRENT_UNAVAILABLE_MESSAGE } from '../../../lib/entity/surfaces/drawer/replacement/entity-replacement-current.lib'
import { buildLocationsById } from '../../../locations/lib/location-display'

function withOrganizationLocationDrawerIndex(locations: Parameters<typeof buildLocationsById>[0]) {
  return {
    organization: { name: 'City Council' },
    campaignId: STORY_CAMPAIGN_ID,
    locations,
    locationsById: buildLocationsById(locations),
  }
}

describe('OrganizationLocationConnectionLinkDrawer', () => {
  it('hides location picker and footer while editing kind upstream', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([testBuildingLocation()])}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(screen.getByRole('button', { name: 'Select' }))

    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(screen.getByRole('radiogroup', { name: 'Relationship type' })).toBeInTheDocument()
    expect(screen.queryByText('Royal Mint')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add site relationship' })).not.toBeInTheDocument()
  })

  it('opens with kind radios and canonical descriptions for site family add', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([testBuildingLocation()])}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.getByText(
        /Connect this organization to a specific site or facility it owns, occupies, operates, or uses as headquarters/i,
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Relationship type' })).toBeInTheDocument()
    expect(screen.getByText(/Owns or holds title to a property or site/i)).toBeInTheDocument()
    expect(screen.getByText(ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Owner/i }))

    expect(screen.getByRole('button', { name: 'Owner, Change' })).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Relationship type' })).not.toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
  })

  it('shows a disabled headquarters option with the existing location reason in add site relationship', () => {
    const guildhouse = testBuildingLocation({ id: 'building-hq', name: 'Thieves Guildhouse' })

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([
          guildhouse,
          testBuildingLocation({ id: 'building-2', name: 'The Silver Eel' }),
        ])}
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
    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([northernMarchRegion()])}
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
      screen.getByText('Choose a settlement or region for this area of operation.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Settlements' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regions' })).toBeInTheDocument()
    expect(screen.getByText('Northern March')).toBeInTheDocument()
  })

  it('filters geographic presence locations by settlement and region segments', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([
          northernMarchRegion(),
          testSettlementLocation(),
          testDistrictLocation(),
        ])}
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

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([
          northernMarchRegion(),
          testSettlementLocation(),
          testDistrictLocation(),
        ])}
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
    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="geographic_presence"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([northernMarchRegion()])}
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

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="territorial_authority"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([northernMarchRegion()])}
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
          organizationId="org-1"
          {...withOrganizationLocationDrawerIndex([testBuildingLocation()])}
          existingConnections={[]}
          edgesByLocationId={{}}
          occupancyLoaded
          onSubmit={vi.fn()}
        />
      )
    }

    renderWithProviders(<ControlledDrawer />)

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

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeKind"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([testBuildingLocation()])}
        existingConnections={[{ id: 'conn-1', locationId: 'building-1', kind: 'headquarters' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-1', locationId: 'building-1', kind: 'headquarters' }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change connection type' })).toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
    expect(screen.queryByText('Location')).not.toBeInTheDocument()
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

    const infrastructureLocation = makeLocation({
      kind: 'structure',
      id: 'infrastructure-1',
      name: 'City Waterworks',
      slug: 'city-waterworks',
      structureType: 'infrastructure',
    })

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([infrastructureLocation, testBuildingLocation()])}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(
      within(screen.getByText('City Waterworks').closest('[data-picker-item-key]')!).getByRole(
        'button',
        {
          name: 'Select',
        },
      ),
    )

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))

    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
    expect(screen.queryByText('City Waterworks')).not.toBeInTheDocument()
  })

  it('shows current and new location fields for headquarters changeTarget', async () => {
    const user = userEvent.setup()
    const guildhouse = testBuildingLocation({ id: 'building-hq', name: 'Thieves Guildhouse' })
    const silverEel = testBuildingLocation({
      id: 'building-2',
      name: 'The Silver Eel',
      slug: 'silver-eel',
    })
    const headquartersPresentation = resolveOrganizationForwardTargetPresentation('headquarters')
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([guildhouse, testSettlementLocation(), silverEel])}
        existingConnections={[{ id: 'conn-hq', locationId: guildhouse.id, kind: 'headquarters' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-hq', locationId: guildhouse.id, kind: 'headquarters' }}
        currentEndpoint={{
          entity: {
            heading: 'Thieves Guildhouse',
            headingSuffix: ' · Structure',
          },
        }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change headquarters location' })).toBeInTheDocument()
    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText('New location')).toBeInTheDocument()
    expect(screen.getByText('Thieves Guildhouse')).toBeInTheDocument()
    expect(screen.getByText('Structure')).toBeInTheDocument()
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
      within(screen.getByText('The Silver Eel').closest('[data-picker-item-key]')!).getByRole(
        'button',
        {
          name: 'Select',
        },
      ),
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
    const staleSettlement = testSettlementLocation({ id: 'settlement-hq', name: 'Legacy Port HQ' })
    const silverEel = testBuildingLocation({
      id: 'building-2',
      name: 'The Silver Eel',
      slug: 'silver-eel',
    })

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([silverEel])}
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
          entity: {
            heading: 'Legacy Port HQ',
            headingSuffix: ' · Settlement',
          },
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
    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([testBuildingLocation()])}
        existingConnections={[{ id: 'conn-hq', locationId: 'missing-loc', kind: 'headquarters' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-hq', locationId: 'missing-loc', kind: 'headquarters' }}
        currentEndpoint={{
          entity: { heading: 'Unavailable location' },
          unavailable: true,
        }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText('Unavailable location')).toBeInTheDocument()
    expect(screen.getByText(ENTITY_REPLACEMENT_CURRENT_UNAVAILABLE_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search structures…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save change' })).not.toBeInTheDocument()
  })

  it('excludes settlements from headquarters add picker', async () => {
    const user = userEvent.setup()
    const silverEel = testBuildingLocation({
      id: 'building-2',
      name: 'The Silver Eel',
      slug: 'silver-eel',
    })

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([testSettlementLocation(), silverEel])}
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

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([testBuildingLocation()])}
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
    expect(screen.getByRole('button', { name: 'Owner, Change' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations in kind summary mode', async () => {
    const user = userEvent.setup()

    const { container } = renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([testBuildingLocation()])}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await expectNoAxeViolations(container)
  })

  it('shows area-of-operation changeTarget with organization context and location replacement', async () => {
    const lankhmar = testSettlementLocation({ id: 'settlement-lankhmar', name: 'Lankhmar' })
    const nehwon = northernMarchRegion({ id: 'region-nehwon', name: 'Nehwon' })
    const portCity = testSettlementLocation({ settlementType: 'town' })
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="geographic_presence"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([lankhmar, nehwon, portCity])}
        existingConnections={[{ id: 'conn-1', locationId: lankhmar.id, kind: 'operates_in' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-1', locationId: lankhmar.id, kind: 'operates_in' }}
        currentEndpoint={{
          entity: {
            heading: 'Lankhmar',
            headingSuffix: ' · Settlement · City',
            supportingText: 'Located in Nehwon',
          },
        }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change area of operation' })).toBeInTheDocument()
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.getByText('Current location')).toBeInTheDocument()
    expect(screen.getByText('New location')).toBeInTheDocument()
    expect(screen.getByText('Lankhmar')).toBeInTheDocument()
    expect(screen.getByText('Settlement · City')).toBeInTheDocument()
    expect(screen.getByText('Located in Nehwon')).toBeInTheDocument()
    expect(
      screen.getByText('Choose a settlement or region for this area of operation.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settlements' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regions' })).toBeInTheDocument()

    await user.click(
      within(screen.getByText('Port City').closest('[data-picker-item-key]')!).getByRole('button', {
        name: 'Select',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Save change' }))

    expect(onSubmit).toHaveBeenCalledWith({
      locationId: portCity.id,
      kind: 'operates_in',
    })
  })

  it('shows territorial changeTarget with territory replacement labels', () => {
    const nehwon = northernMarchRegion({ id: 'region-nehwon', name: 'Nehwon' })
    const kingdom = northernMarchRegion({
      id: 'region-kingdom',
      name: 'Kingdom of Foo',
      parentLocationId: nehwon.id,
    })
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="territorial_authority"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([nehwon, kingdom, northernMarchRegion()])}
        existingConnections={[{ id: 'conn-1', locationId: kingdom.id, kind: 'governs' }]}
        edgesByLocationId={{}}
        occupancyLoaded
        initialConnection={{ id: 'conn-1', locationId: kingdom.id, kind: 'governs' }}
        currentEndpoint={{
          entity: {
            heading: 'Kingdom of Foo',
            headingSuffix: ' · Region · Kingdom',
            supportingText: 'Located in Nehwon',
          },
        }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change governed territory' })).toBeInTheDocument()
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.getByText('Current territory')).toBeInTheDocument()
    expect(screen.getByText('New territory')).toBeInTheDocument()
    expect(screen.getByText('Kingdom of Foo')).toBeInTheDocument()
    expect(screen.getByText('Region · Kingdom')).toBeInTheDocument()
    expect(screen.getByText('Located in Nehwon')).toBeInTheDocument()
  })

  it('does not show authoritative-empty for changeTarget when candidate set is partial', () => {
    const current = northernMarchRegion()

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeTarget"
        intent="geographic_presence"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([current])}
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

  it('preserves the location picker and blocks relationship actions while nested create is active', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="territorial_authority"
        organizationId="org-1"
        {...withOrganizationLocationDrawerIndex([northernMarchRegion()])}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Controls/i }))

    const search = screen.getByPlaceholderText('Search locations…')
    await user.type(search, 'North')
    expect(screen.getByText('Northern March')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create region' }))

    expect(screen.getByText('Northern March')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search locations…', hidden: true })).toHaveValue(
      'North',
    )
    expect(
      screen.getByRole('button', { name: 'Add territorial authority', hidden: true }),
    ).toBeDisabled()
  })
})
