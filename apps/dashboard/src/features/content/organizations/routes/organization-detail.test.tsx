import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CITY_COUNCIL } from '../fixtures'
import { OrganizationDetailContent } from './organization-detail'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))
vi.mock(
  '../components/location-connections/organization-location-connections-detail-section.client',
  () => ({
    OrganizationLocationConnectionsDetailSection: () => (
      <div data-testid="organization-detail-section">Location connections</div>
    ),
  }),
)
vi.mock('../components/members/organization-members-detail-section.client', () => ({
  OrganizationMembersDetailSection: () => (
    <div data-testid="organization-detail-section">Members</div>
  ),
}))

function renderDetail() {
  const queryClient = makeTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrganizationDetailContent organization={CITY_COUNCIL} campaignId={STORY_CAMPAIGN_ID} />
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

  it('orders Members ahead of location connections', () => {
    renderDetail()
    expect(
      screen.getAllByTestId('organization-detail-section').map((el) => el.textContent),
    ).toEqual(['Members', 'Location connections'])
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
