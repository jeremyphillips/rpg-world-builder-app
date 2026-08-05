import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR } from '../components/organization-location-connections-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import { CITY_COUNCIL } from '../fixtures'
import { useOrganizationConnectedCharacters } from '../hooks/use-organization-connected-characters'
import { useOrganizationLocationReferences } from '../hooks/use-organization-location-references'
import { OrganizationDetailContent } from './organization-detail'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))

const mockUseOrganizationLocationReferences = vi.mocked(useOrganizationLocationReferences)
vi.mock('../hooks/use-organization-location-references', () => ({
  useOrganizationLocationReferences: vi.fn(() => ({
    data: [],
    isPending: false,
    isError: false,
    error: null,
  })),
}))
vi.mock('../hooks/use-organization-location-connection-mutations', () => ({
  useOrganizationLocationConnectionMutations: vi.fn(() => ({
    removeLocationConnection: vi.fn(),
    isPending: false,
    pendingConnectionId: undefined,
    error: null,
    resetErrors: vi.fn(),
  })),
}))
vi.mock('../hooks/use-organization-connected-characters', () => ({
  useOrganizationConnectedCharacters: vi.fn(() => ({
    data: {
      items: [
        {
          characterType: 'npc',
          character: {
            id: 'npc-1',
            name: 'Circle Envoy',
            summary: 'Human · Level 3 Rogue',
          },
        },
      ],
      total: 1,
    },
    isPending: false,
    isError: false,
    error: null,
  })),
}))

const mockUseOrganizationConnectedCharacters = vi.mocked(useOrganizationConnectedCharacters)

function renderDetail() {
  return render(
    <MemoryRouter>
      <OrganizationDetailContent organization={CITY_COUNCIL} campaignId={STORY_CAMPAIGN_ID} />
    </MemoryRouter>,
  )
}

describe('OrganizationDetailContent', () => {
  it('renders kind metadata, authored description, and connected characters', () => {
    renderDetail()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('The elected council governing the city.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Location connections' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Connected characters' })).toBeInTheDocument()
    expect(screen.getByText('1 connected character')).toBeInTheDocument()
    expect(screen.getByText('Circle Envoy')).toBeInTheDocument()
    expect(screen.queryByText(/members/i)).not.toBeInTheDocument()
  })

  it('shows loading copy while connected characters are pending', () => {
    mockUseOrganizationConnectedCharacters.mockReturnValueOnce({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useOrganizationConnectedCharacters>)

    renderDetail()

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(
      screen.queryByText(ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters),
    ).not.toBeInTheDocument()
  })

  it('shows location connections load error separately from empty state', () => {
    mockUseOrganizationLocationReferences.mockReturnValueOnce({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('failed'),
    } as ReturnType<typeof useOrganizationLocationReferences>)

    renderDetail()

    expect(screen.getByText(ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR)).toBeInTheDocument()
    expect(
      screen.queryByText(ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections),
    ).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
