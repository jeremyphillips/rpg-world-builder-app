import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CITY_COUNCIL } from '../fixtures'
import { OrganizationDetailContent } from './organization-detail'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))

function renderDetail() {
  return render(
    <MemoryRouter>
      <OrganizationDetailContent organization={CITY_COUNCIL} campaignId={STORY_CAMPAIGN_ID} />
    </MemoryRouter>,
  )
}

describe('OrganizationDetailContent', () => {
  it('renders kind metadata and authored description without reverse membership', () => {
    renderDetail()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('The elected council governing the city.')).toBeInTheDocument()
    expect(screen.queryByText(/members/i)).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderDetail()
    await expectNoAxeViolations(container)
  })
})
