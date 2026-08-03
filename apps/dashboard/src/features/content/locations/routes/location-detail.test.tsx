import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { LOCATIONS_LIST, WATERDEEP, YAWNING_PORTAL } from '../fixtures'
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
}))

function renderDetail(location = WATERDEEP) {
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
  it('renders kind metadata, ancestry path, and contained locations', () => {
    renderDetail()

    expect(screen.getByText('Settlement')).toBeInTheDocument()
    expect(screen.getByText('City')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Location path' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faerûn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sword Coast' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contained locations' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
  })

  it('shows empty copy when there are no contained locations', () => {
    renderDetail(YAWNING_PORTAL)

    expect(screen.getByText(LOCATION_EMPTY_SECTION_TEXT.children)).toBeInTheDocument()
  })

  it('shows add-location shortcuts for campaign managers', () => {
    useCanManageCampaignMock.mockReturnValue(true)
    renderDetail(WATERDEEP)

    expect(screen.getByRole('button', { name: 'Add location' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
