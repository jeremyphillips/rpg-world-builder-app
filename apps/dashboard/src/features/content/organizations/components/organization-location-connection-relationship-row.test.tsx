import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type { Location } from '@rpg/contracts'

import { buildLocationsById } from '../../locations/lib/location-display'
import { ALDERMERE, YAWNING_PORTAL, LOCATIONS_LIST } from '../../locations/fixtures'
import { buildOrganizationLocationConnectionCards } from '../lib/build-organization-location-connection-cards'
import { OrganizationLocationConnectionRelationshipRow } from './organization-location-connection-relationship-row.client'

const CAMPAIGN_ID = 'camp_1'
const locationsById = buildLocationsById(LOCATIONS_LIST)

function previewItemFor(location: Location | null, connectionId = 'conn-1') {
  const { previewItems } = buildOrganizationLocationConnectionCards(
    [
      {
        connection: {
          id: connectionId,
          locationId: location?.id ?? 'missing-location',
          kind: 'headquarters',
        },
        location,
      },
    ],
    { campaignId: CAMPAIGN_ID, locationsById },
  )
  return previewItems[0]!
}

const mutationContext = {
  subjectOrganizationId: 'org-1',
  locationCandidates: { items: LOCATIONS_LIST, isAuthoritativeDomainSet: true },
  connections: [{ id: 'conn-1', locationId: YAWNING_PORTAL.id, kind: 'headquarters' as const }],
  occupancyLoaded: true,
}

describe('OrganizationLocationConnectionRelationshipRow', () => {
  it('renders compact name link, classification suffix, and nearest-parent context', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionRelationshipRow
          item={previewItemFor(YAWNING_PORTAL)}
          canManage={false}
          mutationContext={mutationContext}
        />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Yawning Portal' })
    expect(link).toBeInTheDocument()
    expect(link.textContent).toBe('Yawning Portal')
    expect(link.parentElement?.parentElement).toHaveTextContent('Yawning Portal·Building · Tavern')
    expect(screen.getByText('Building · Tavern')).toBeInTheDocument()
    expect(
      link.parentElement?.parentElement?.querySelector('[aria-hidden="true"]'),
    ).toHaveTextContent('·')
    expect(screen.getByText('Located in Dock Ward')).toBeInTheDocument()
    expect(
      screen.queryByText('Aldermere / Greyshore / Harborford / Dock Ward'),
    ).not.toBeInTheDocument()
  })

  it('omits nearest-parent line for root locations', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionRelationshipRow
          item={previewItemFor(ALDERMERE)}
          canManage={false}
          mutationContext={mutationContext}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Aldermere' })).toBeInTheDocument()
    expect(screen.queryByText(/^Located in /)).not.toBeInTheDocument()
  })

  it('renders unavailable badge when target is null', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionRelationshipRow
          item={previewItemFor(null)}
          canManage={false}
          mutationContext={mutationContext}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Unavailable location')).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('shows overflow actions for managers', async () => {
    const user = userEvent.setup()
    const onChangeKindConnection = vi.fn()

    render(
      <MemoryRouter>
        <OrganizationLocationConnectionRelationshipRow
          item={previewItemFor(YAWNING_PORTAL)}
          canManage
          mutationContext={mutationContext}
          onChangeKindConnection={onChangeKindConnection}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for Yawning Portal' }))
    await user.click(screen.getByRole('menuitem', { name: 'Change relationship type' }))
    expect(onChangeKindConnection).toHaveBeenCalledWith({
      connectionId: 'conn-1',
      locationId: YAWNING_PORTAL.id,
      kind: 'headquarters',
    })
  })
})
