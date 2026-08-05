import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { canInverseWriteCrossContentRelationship } from '@rpg/contracts'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR } from '../lib/organization-connected-regions.constants'
import { OrganizationConnectedRegionsSection } from './organization-connected-regions-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'

const sampleConnectedRegions = {
  previewItems: [
    {
      relationshipId: 'ta-governs',
      card: {
        id: 'region-1',
        name: 'Grey Coast',
        summary: 'Territorial authority · Governs',
      },
      detailHref: '/campaigns/camp-1/locations/region-1',
    },
  ],
  total: 3,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
}

describe('OrganizationConnectedRegionsSection', () => {
  it('renders count, preview cards, and truncation copy', () => {
    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection connectedRegions={sampleConnectedRegions} />
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

  it('does not render inverse edit affordances while registry inverse capability is read-only', () => {
    expect(canInverseWriteCrossContentRelationship('region_territorial_authority')).toBe(false)

    render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection connectedRegions={sampleConnectedRegions} />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationConnectedRegionsSection connectedRegions={sampleConnectedRegions} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
