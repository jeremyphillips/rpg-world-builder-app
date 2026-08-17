import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  testBuildingLocation,
  testRegionLocation,
} from '@/features/content/lib/fixtures/location-test-helpers'
import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'

import {
  OrganizationLocationConnectionsSection,
  ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
} from './organization-location-connections-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import { buildOrganizationLocationConnectionCards } from '../lib/build-organization-location-connection-cards'
import { buildLocationsById } from '../../locations/lib/location-display'

function regionLocation(overrides: Parameters<typeof testRegionLocation>[0] = {}) {
  return testRegionLocation({
    name: 'Northern March',
    slug: 'northern-march',
    ...overrides,
  })
}

const sampleLocations = [
  testBuildingLocation(),
  testBuildingLocation({ id: 'building-2', name: 'Royal Palace', slug: 'royal-palace' }),
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
    { campaignId: STORY_CAMPAIGN_ID, locationsById: buildLocationsById(sampleLocations) },
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

    expect(screen.getByText('Royal Mint')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Sites & facilities', level: 3 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Owns')).toBeInTheDocument()
    expect(screen.getByText('Headquarters')).toBeInTheDocument()
  })

  it('omits kind eyebrows for Areas of operation while keeping site kind labels', () => {
    const northernMarch = regionLocation()
    const operatesInConnections = {
      ...buildOrganizationLocationConnectionCards(
        [
          {
            connection: { id: 'conn-3', locationId: northernMarch.id, kind: 'operates_in' },
            location: northernMarch,
          },
        ],
        {
          campaignId: STORY_CAMPAIGN_ID,
          locationsById: buildLocationsById([northernMarch]),
        },
      ),
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
    }

    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection locationConnections={operatesInConnections} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Areas of operation', level: 3 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Northern March')).toBeInTheDocument()
    expect(screen.queryByText('Operates in')).not.toBeInTheDocument()
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

    expect(screen.getByRole('button', { name: 'Add site relationship' })).toBeInTheDocument()
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

    expect(screen.queryByText('Royal Mint')).not.toBeInTheDocument()

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
              items: sampleLocations,
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

    await user.click(screen.getByRole('button', { name: 'Add site relationship' }))
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
