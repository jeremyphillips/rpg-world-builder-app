import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { canInverseWriteCrossContentRelationship } from '@rpg/contracts'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR } from '../lib/organization-connected-regions.constants'
import { ORGANIZATION_TERRITORIAL_INVERSE_ADD_LABEL } from '../lib/organization-territorial-authority-inverse.lib'
import { OrganizationConnectedRegionsSection } from './organization-connected-regions-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'

const territorialPreviewItem = {
  relationshipId: 'ta-governs',
  relationshipFamily: 'territorialAuthority' as const,
  relationshipKind: 'governs',
  regionId: 'region-1',
  card: {
    id: 'region-1',
    name: 'Grey Coast',
    summary: 'Territorial authority · Governs',
  },
  detailHref: '/campaigns/camp-1/locations/region-1',
  canEditTerritorial: true,
}

const partyPreviewItem = {
  relationshipId: 'assoc-hq',
  relationshipFamily: 'partyAssociation' as const,
  relationshipKind: 'headquarters',
  regionId: 'region-2',
  card: {
    id: 'region-2',
    name: 'Sunset Vale',
    summary: 'People & organizations · Headquarters',
  },
  detailHref: '/campaigns/camp-1/locations/region-2',
  canEditTerritorial: false,
}

const sampleConnectedRegions = {
  previewItems: [territorialPreviewItem],
  total: 3,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
}

describe('OrganizationConnectedRegionsSection', () => {
  it('renders count, preview cards, and truncation copy', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={sampleConnectedRegions}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Connected regions' })).toBeInTheDocument()
    expect(screen.getByText('3 connected region links')).toBeInTheDocument()
    expect(screen.getByText('Grey Coast')).toBeInTheDocument()
    expect(screen.getByText('+ 2 more')).toBeInTheDocument()
  })

  it('renders singular count copy for one connected region link', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={{
            ...sampleConnectedRegions,
            total: 1,
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('1 connected region link')).toBeInTheDocument()
  })

  it('renders an empty state when no regions are connected', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions)).toBeInTheDocument()
  })

  it('renders loading copy while pending', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
          }}
          isPending
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(
      screen.queryByText(ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions),
    ).not.toBeInTheDocument()
  })

  it('renders error copy when the query fails', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
          }}
          isError
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR)).toBeInTheDocument()
    expect(
      screen.queryByText(ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions),
    ).not.toBeInTheDocument()
  })

  it('renders inverse territorial write affordances when registry and props allow writes', () => {
    expect(canInverseWriteCrossContentRelationship('organization_location_connection')).toBe(true)

    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={sampleConnectedRegions}
          canWriteInverseTerritorial
          onAddTerritorialAuthority={vi.fn()}
          onRemoveTerritorialAuthority={vi.fn()}
          onUpdateTerritorialAuthorityKind={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: ORGANIZATION_TERRITORIAL_INVERSE_ADD_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remove Grey Coast territorial authority' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Authority type')).toBeInTheDocument()
  })

  it('keeps party association rows read-only even when inverse write is enabled', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={{
            previewItems: [partyPreviewItem],
            total: 1,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
          }}
          canWriteInverseTerritorial
          onAddTerritorialAuthority={vi.fn()}
          onRemoveTerritorialAuthority={vi.fn()}
          onUpdateTerritorialAuthorityKind={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(
      screen.queryByRole('button', { name: /Sunset Vale territorial authority/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Authority type')).not.toBeInTheDocument()
  })

  it('does not render inverse write affordances when capability is disabled', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={sampleConnectedRegions}
          canWriteInverseTerritorial={false}
        />
      </MemoryRouter>,
    )

    expect(
      screen.queryByRole('button', { name: ORGANIZATION_TERRITORIAL_INVERSE_ADD_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection
          campaignId="camp-1"
          connectedRegions={sampleConnectedRegions}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
