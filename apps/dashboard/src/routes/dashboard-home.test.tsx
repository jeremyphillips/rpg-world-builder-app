import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type { CampaignListItem } from '@rpg/contracts'

vi.mock('@/features/auth/api/auth-client')
vi.mock('@/features/campaign/api/campaign-client')

import { fetchSession as fetchSessionFn } from '@/features/auth/api/auth-client'
import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeAuthMe } from '@/test/fixtures/session'
import { renderWithProviders } from '@/test/render'
import { DashboardHome } from './dashboard-home'

const fetchSession = vi.mocked(fetchSessionFn)
const listCampaigns = vi.mocked(listCampaignsFn)

const authSession = makeAuthMe()

function campaign(id: string, name: string): CampaignListItem {
  return makeCampaignListItem({ id, identity: { name }, status: 'draft' })
}

function renderHome() {
  return renderWithProviders(<DashboardHome />)
}

describe('DashboardHome', () => {
  beforeEach(() => {
    fetchSession.mockReset()
    listCampaigns.mockReset()
    localStorage.clear()
    fetchSession.mockResolvedValue(authSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('prompts to create the first campaign when the user has none', async () => {
    listCampaigns.mockResolvedValue([])

    renderHome()

    expect(
      await screen.findByText('Create your first campaign to get started.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('View all campaigns')).not.toBeInTheDocument()
  })

  it('links to the campaigns index when the user has several campaigns', async () => {
    listCampaigns.mockResolvedValue([campaign('a', 'Arden'), campaign('b', 'Baldur')])

    renderHome()

    expect(await screen.findByRole('link', { name: 'View all campaigns' })).toHaveAttribute(
      'href',
      '/campaigns',
    )
    expect(screen.queryByText('Your campaigns')).not.toBeInTheDocument()
  })

  it('shows a continue card for a remembered campaign with completed onboarding', async () => {
    listCampaigns.mockResolvedValue([
      campaign('camp_active', 'Active Campaign'),
      campaign('camp_other', 'Other Campaign'),
    ])
    localStorage.setItem('rpg.selectedCampaignId', 'camp_active')

    renderHome()

    expect(await screen.findByText('Continue campaign')).toBeInTheDocument()
    expect(screen.getByText('Active Campaign')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('hides the continue card when the remembered campaign has incomplete onboarding', async () => {
    listCampaigns.mockResolvedValue([
      makeCampaignListItem({
        id: 'camp_incomplete',
        identity: { name: 'Incomplete Campaign' },
        campaignRole: 'pc',
        controlledCharacterIds: [],
        viewerOnboardingState: 'incomplete',
      }),
      makeCampaignListItem({
        id: 'camp_active',
        identity: { name: 'Active Campaign' },
        campaignRole: 'owner',
      }),
    ])
    localStorage.setItem('rpg.selectedCampaignId', 'camp_incomplete')

    renderHome()

    expect(await screen.findByRole('link', { name: 'View all campaigns' })).toBeInTheDocument()
    expect(screen.queryByText('Continue campaign')).not.toBeInTheDocument()
  })
})
