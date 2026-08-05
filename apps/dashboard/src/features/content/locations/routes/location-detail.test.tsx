import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { LOCATIONS_LIST, HARBORFORD, YAWNING_PORTAL } from '../fixtures'
import { LOCATION_EMPTY_SECTION_TEXT } from '../lib/location-display'
import { LocationDetailContent } from './location-detail'

const { useCanManageCampaignMock } = vi.hoisted(() => ({
  useCanManageCampaignMock: vi.fn(() => false),
}))

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: useCanManageCampaignMock,
  useCampaignCharacters: vi.fn(() => ({ data: [] })),
}))
vi.mock('@/features/character', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useCampaignBuildContext: vi.fn(() => ({ catalogIndex: undefined })),
    useNpcs: vi.fn(() => ({ data: [] })),
  }
})
vi.mock('../components/location-connected-parties-detail-sections.client', () => ({
  LocationConnectedPartiesDetailSections: () => null,
}))
vi.mock('@/features/content/organizations/hooks/use-organizations', () => ({
  useOrganizations: vi.fn(() => ({ data: [] })),
}))

function renderDetail(location = HARBORFORD) {
  return render(
    <MemoryRouter>
      <LocationDetailContent
        location={location}
        campaignId={STORY_CAMPAIGN_ID}
        locations={LOCATIONS_LIST}
      />
    </MemoryRouter>,
  )
}

describe('LocationDetailContent', () => {
  it('renders identity metadata, located-in links, and contained locations', () => {
    renderDetail()

    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Settlement')).toBeInTheDocument()
    expect(screen.getByText('Classification')).toBeInTheDocument()
    expect(screen.getByText('City')).toBeInTheDocument()
    expect(screen.getByText('Located in')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Location path' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Aldermere' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Greyshore' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contained locations' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument()
  })

  it('shows building archetype in identity metadata', () => {
    renderDetail(YAWNING_PORTAL)

    expect(screen.getByText('Archetype')).toBeInTheDocument()
    expect(screen.getByText('Tavern')).toBeInTheDocument()
  })

  it('shows empty copy when there are no contained locations', () => {
    renderDetail(YAWNING_PORTAL)

    expect(screen.getByText(LOCATION_EMPTY_SECTION_TEXT.children)).toBeInTheDocument()
  })

  it('shows add-location shortcuts for campaign managers', () => {
    useCanManageCampaignMock.mockReturnValue(true)
    renderDetail(HARBORFORD)

    expect(screen.getByRole('button', { name: 'Add location' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
