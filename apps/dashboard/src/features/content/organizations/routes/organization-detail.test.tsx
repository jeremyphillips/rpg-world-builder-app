import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeOrganization } from '@/test/fixtures/factories/organization'
import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CITY_COUNCIL } from '../fixtures'
import { OrganizationDetailContent } from './organization-detail'

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))
vi.mock(
  '../components/location-connections/organization-location-connections-detail-section',
  () => ({
    OrganizationLocationConnectionsDetailSection: () => (
      <div data-testid="organization-detail-section">Location connections</div>
    ),
  }),
)
vi.mock('../components/members/organization-members-detail-section', () => ({
  OrganizationMembersDetailSection: () => (
    <div data-testid="organization-detail-section">Members</div>
  ),
}))

function renderDetail(organization = CITY_COUNCIL) {
  const queryClient = makeTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrganizationDetailContent organization={organization} campaignId={STORY_CAMPAIGN_ID} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('OrganizationDetailContent', () => {
  it('renders kind metadata and the authored description', () => {
    renderDetail()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('The elected council governing the city.')).toBeInTheDocument()
  })

  it('orders Members, membership titles, and location connections', () => {
    renderDetail()
    expect(
      screen.getAllByTestId('organization-detail-section').map((el) => el.textContent),
    ).toEqual(['Members', 'Location connections'])
    const membersSection = screen.getAllByTestId('organization-detail-section')[0]!
    const titlesHeading = screen.getByRole('heading', { name: 'Membership titles' })
    const locationsSection = screen.getAllByTestId('organization-detail-section')[1]!

    expect(
      membersSection.compareDocumentPosition(titlesHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      titlesHeading.compareDocumentPosition(locationsSection) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders the membership title catalog in canonical order', () => {
    renderDetail()
    const list = screen.getByTestId('organization-membership-titles-list')
    const items = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(items).toEqual(['Chair', 'Clerk'])
  })

  it('renders the membership titles empty state', () => {
    renderDetail(
      makeOrganization({
        members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
      }),
    )
    expect(screen.getByText('No membership titles')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
