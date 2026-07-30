import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type { CampaignListItem } from '@rpg/contracts'

vi.mock('@/features/auth/api/auth-client')
vi.mock('@/features/campaign/api/campaign-client')

import { fetchSession as fetchSessionFn } from '@/features/auth/api/auth-client'
import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { CAMPAIGNS_QUERY_ERROR_MESSAGE } from '@/features/campaign'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeAuthMe } from '@/test/fixtures/session'
import { renderWithProviders } from '@/test/render'
import { DashboardHome } from './dashboard-home'
import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'

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

  it('renders the welcome header, starter cards, and invitation copy', async () => {
    listCampaigns.mockResolvedValue([])

    renderHome()

    expect(await screen.findByRole('heading', { name: /Welcome,/ })).toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.subtitle)).toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.starterCards.campaign.title)).toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.starterCards.character.title)).toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.invitationHeading)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New campaign' })).toHaveAttribute(
      'href',
      '/campaigns/new',
    )
    expect(screen.queryByRole('link', { name: 'View all campaigns' })).not.toBeInTheDocument()
  })

  it('shows an error alert without implying an empty campaign list', async () => {
    listCampaigns.mockRejectedValue(new Error('network'))

    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent(CAMPAIGNS_QUERY_ERROR_MESSAGE)
    expect(screen.queryByText('Continue campaign')).not.toBeInTheDocument()
    expect(screen.queryByText('Resume setup')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View all campaigns' })).not.toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.starterCards.campaign.title)).toBeInTheDocument()
  })

  it('hides the campaigns index link when the user has only one campaign', async () => {
    listCampaigns.mockResolvedValue([campaign('a', 'Arden')])

    renderHome()

    await screen.findByText(DASHBOARD_HOME_COPY.subtitle)
    expect(screen.queryByRole('link', { name: 'View all campaigns' })).not.toBeInTheDocument()
  })

  it('links to the campaigns index when the user has several campaigns', async () => {
    listCampaigns.mockResolvedValue([campaign('a', 'Arden'), campaign('b', 'Baldur')])

    renderHome()

    expect(await screen.findByRole('link', { name: 'View all campaigns' })).toHaveAttribute(
      'href',
      '/campaigns',
    )
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

  it('shows a resume setup card for a remembered incomplete campaign', async () => {
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

    expect(await screen.findByRole('heading', { name: 'Resume setup' })).toBeInTheDocument()
    expect(screen.getByText('Incomplete Campaign')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Resume setup' })).toHaveAttribute(
      'href',
      '/campaigns/camp_incomplete/onboarding',
    )
    expect(screen.queryByText('Continue campaign')).not.toBeInTheDocument()
  })
})
