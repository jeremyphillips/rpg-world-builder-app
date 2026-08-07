import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { Location, Organization } from '@rpg/contracts'

import {
  OrganizationLocationConnectionLinkDrawer,
  ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE,
  ORGANIZATION_LOCATION_LINK_NO_RESULTS,
} from './organization-location-connection-link-drawer.client'
import { RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES } from '../../lib/relationship/relationship-alternatives'

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
    expect(screen.queryByRole('textbox', { name: 'Search locations…' })).not.toBeInTheDocument()
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

    render(
      <OrganizationLocationConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        intent="site"
        organization={organization}
        organizationId="org-1"
        locations={[settlementLocation(), buildingLocation()]}
        existingConnections={[]}
        edgesByLocationId={{}}
        occupancyLoaded
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))
    await user.click(
      within(screen.getByText('Port City').closest('article')!).getByRole('button', {
        name: 'Select',
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: /Owner/i }))

    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
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
    await user.type(screen.getByRole('textbox', { name: 'Search locations…' }), 'zzzz-no-match')

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
