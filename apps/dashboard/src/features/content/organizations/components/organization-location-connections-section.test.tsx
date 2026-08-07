import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { Location } from '@rpg/contracts'

import {
  OrganizationLocationConnectionsSection,
  ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
} from './organization-location-connections-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import { buildOrganizationLocationConnectionCards } from '../lib/build-organization-location-connection-cards'
import { buildLocationsById } from '../../locations/lib/location-display'

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

const sampleLocations = [
  buildingLocation(),
  buildingLocation({ id: 'building-2', name: 'Royal Palace', slug: 'royal-palace' }),
]
const sampleLocationConnections = {
  ...buildOrganizationLocationConnectionCards(
    [
      {
        connection: { id: 'conn-1', locationId: 'building-1', kind: 'owns' },
        location: sampleLocations[0]!,
      },
      {
        connection: { id: 'conn-2', locationId: 'building-2', kind: 'headquarters' },
        location: sampleLocations[1]!,
      },
    ],
    { campaignId: 'camp-1', locationsById: buildLocationsById(sampleLocations) },
  ),
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
}

describe('OrganizationLocationConnectionsSection', () => {
  it('renders family and populated kind grouped location connection rows', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection locationConnections={sampleLocationConnections} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Location connections' })).toBeInTheDocument()
    expect(screen.getByText('2 location connections')).toBeInTheDocument()
    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Sites & facilities', level: 3 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Owns')).toBeInTheDocument()
    expect(screen.getByText('Headquarters')).toBeInTheDocument()
  })

  it('renders a family empty state without per-kind empty groups', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
          }}
          canManage
          showEmptySection
          visibleFamilies={['site']}
          canAddToFamily={{ site: true }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('No site relationships linked.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add site relationship' })).toBeInTheDocument()
    expect(screen.queryByText('No owned locations linked.')).not.toBeInTheDocument()
    expect(screen.queryByText('Owner')).not.toBeInTheDocument()
  })

  it('keeps populated families visible when add is unavailable', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={sampleLocationConnections}
          canManage
          showEmptySection
          visibleFamilies={['site']}
          canAddToFamily={{ site: false }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add site relationship/i })).not.toBeInTheDocument()
  })

  it('shows family add when populated and additional targets are available', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={sampleLocationConnections}
          canManage
          showEmptySection
          visibleFamilies={['site']}
          canAddToFamily={{ site: true }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '+ Add site relationship' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add owned location' })).not.toBeInTheDocument()
  })

  it('renders error states and hides section when showEmptySection is false', () => {
    const { rerender } = render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
          }}
          showEmptySection={false}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('heading', { name: 'Location connections' })).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={sampleLocationConnections}
          isError
          errorText={ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR)).toBeInTheDocument()
  })

  it('invokes family add and change-kind callbacks for managers when alternatives exist', async () => {
    const user = userEvent.setup()
    const onAddFamily = vi.fn()
    const onChangeKindConnection = vi.fn()

    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={sampleLocationConnections}
          canManage
          showEmptySection
          visibleFamilies={['site']}
          canAddToFamily={{ site: true }}
          onAddFamily={onAddFamily}
          onChangeKindConnection={onChangeKindConnection}
          mutationContext={{
            subjectOrganizationId: 'org-1',
            locationCandidates: {
              items: [
                {
                  id: 'building-1',
                  campaignId: 'camp-1',
                  name: 'Royal Mint',
                  slug: 'royal-mint',
                  kind: 'structure',
                },
                {
                  id: 'building-2',
                  campaignId: 'camp-1',
                  name: 'Royal Palace',
                  slug: 'royal-palace',
                  kind: 'structure',
                },
              ] as Location[],
              isAuthoritativeDomainSet: true,
            },
            connections: [
              { id: 'conn-1', locationId: 'building-1', kind: 'owns' },
              { id: 'conn-2', locationId: 'building-2', kind: 'headquarters' },
            ],
            occupancyLoaded: true,
          }}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '+ Add site relationship' }))
    expect(onAddFamily).toHaveBeenCalledWith('site')

    await user.click(screen.getByRole('button', { name: 'Actions for Royal Mint' }))
    await user.click(screen.getByRole('menuitem', { name: 'Change relationship type' }))
    expect(onChangeKindConnection).toHaveBeenCalledWith({
      connectionId: 'conn-1',
      locationId: 'building-1',
      kind: 'owns',
    })
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection locationConnections={sampleLocationConnections} />
      </MemoryRouter>,
    )
    await expectNoAxeViolations(container)
  })
})
