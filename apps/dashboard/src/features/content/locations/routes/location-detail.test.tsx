import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ALDERMERE, LOCATIONS_LIST, HARBORFORD, YAWNING_PORTAL } from '../fixtures'
import { LOCATION_EMPTY_SECTION_TEXT } from '../lib/location-display'
import { LocationDetailContent } from './location-detail'

const { useCanManageCampaignMock } = vi.hoisted(() => ({
  useCanManageCampaignMock: vi.fn(() => false),
}))

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
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
vi.mock('../components/connected-parties/location-connected-parties-detail-sections', () => ({
  LocationConnectedPartiesDetailSections: () => <section aria-label="Connected parties sections" />,
}))
vi.mock('@/features/content/organizations/hooks/use-organizations', () => ({
  useOrganizations: vi.fn(() => ({ data: [] })),
}))

function renderDetail(location = HARBORFORD) {
  const queryClient = makeTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LocationDetailContent
          location={location}
          campaignId={STORY_CAMPAIGN_ID}
          locations={LOCATIONS_LIST}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LocationDetailContent', () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(false)
  })

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
    expect(screen.getByRole('heading', { name: 'City structure' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument()
  })

  it('renders contained locations before connected parties sections', () => {
    renderDetail()

    const containedHeading = screen.getByRole('heading', { name: 'City structure' })
    const connectedPartiesSection = screen.getByLabelText('Connected parties sections')

    expect(
      containedHeading.compareDocumentPosition(connectedPartiesSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('shows building facility type in identity metadata', () => {
    renderDetail(YAWNING_PORTAL)

    expect(screen.getByText('Facility type')).toBeInTheDocument()
    expect(screen.getByText('Brewery')).toBeInTheDocument()
  })

  it('shows empty copy when there are no contained locations', () => {
    renderDetail(YAWNING_PORTAL)

    expect(screen.getByText(LOCATION_EMPTY_SECTION_TEXT.children)).toBeInTheDocument()
  })

  it('shows Direct locations Add location for campaign managers on City structure', () => {
    useCanManageCampaignMock.mockReturnValue(true)
    renderDetail(HARBORFORD)

    expect(screen.getByRole('button', { name: 'Add location' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add district' })).toBeInTheDocument()
  })

  it('shows Change parent for managers on nested locations', () => {
    useCanManageCampaignMock.mockReturnValue(true)
    renderDetail(YAWNING_PORTAL)

    expect(screen.getByRole('button', { name: 'Change parent' })).toBeInTheDocument()
  })

  it('shows Set parent for managers on uncontained optional roots', () => {
    useCanManageCampaignMock.mockReturnValue(true)
    renderDetail(ALDERMERE)

    expect(screen.getByRole('button', { name: 'Set parent' })).toBeInTheDocument()
  })

  it('shows Contained Move overflow for managers instead of a View link', async () => {
    const user = userEvent.setup()
    useCanManageCampaignMock.mockReturnValue(true)
    renderDetail(HARBORFORD)

    expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Actions for Dock Ward' }))
    expect(screen.getByRole('menuitem', { name: 'View location' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Move location' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
