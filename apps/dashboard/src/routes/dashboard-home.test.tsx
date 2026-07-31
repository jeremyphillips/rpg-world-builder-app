import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type { CampaignListItem, PcCharacterListItem } from '@rpg/contracts'

vi.mock('@/features/auth/api/auth-client')
vi.mock('@/features/campaign/api/campaign-client')
vi.mock('@/features/character/api/character-client')

import { fetchSession as fetchSessionFn } from '@/features/auth/api/auth-client'
import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { listCharacters as listCharactersFn } from '@/features/character/api/character-client'
import { CAMPAIGNS_QUERY_ERROR_MESSAGE } from '@/features/campaign'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeAuthMe } from '@/test/fixtures/session'
import { renderWithProviders } from '@/test/render'
import { DashboardHome } from './dashboard-home'
import { DASHBOARD_HOME_COPY } from './dashboard-home-copy'
import { resolveDashboardWelcomeCopy } from './dashboard-home-welcome.lib'

const fetchSession = vi.mocked(fetchSessionFn)
const listCampaigns = vi.mocked(listCampaignsFn)
const listCharacters = vi.mocked(listCharactersFn)

const authSession = makeAuthMe()
const displayName = authSession.user.displayName

function campaign(id: string, name: string): CampaignListItem {
  return makeCampaignListItem({ id, identity: { name }, status: 'draft' })
}

function character(id: string): PcCharacterListItem {
  return {
    id,
    routeContext: { kind: 'standalone' },
  } as PcCharacterListItem
}

function renderHome() {
  return renderWithProviders(<DashboardHome />)
}

describe('DashboardHome', () => {
  beforeEach(() => {
    fetchSession.mockReset()
    listCampaigns.mockReset()
    listCharacters.mockReset()
    localStorage.clear()
    fetchSession.mockResolvedValue(authSession)
    listCharacters.mockResolvedValue([])
  })

  it('renders the welcome header, starter cards, and invitation copy', async () => {
    listCampaigns.mockResolvedValue([])

    renderHome()

    const welcome = resolveDashboardWelcomeCopy({
      hasCampaigns: false,
      hasCharacters: false,
      displayName,
    })
    expect(await screen.findByRole('heading', { name: welcome.title })).toBeInTheDocument()
    expect(screen.getByText(welcome.body)).toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.starterCards.campaign.title)).toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.starterCards.character.title)).toBeInTheDocument()
    expect(screen.getByText(DASHBOARD_HOME_COPY.invitationHeading)).toBeInTheDocument()
    const newCampaignLink = screen.getByRole('link', { name: 'New campaign' })
    expect(newCampaignLink).toHaveAttribute('href', '/campaigns/new')
    expect(newCampaignLink).not.toHaveClass('border-outline-button-border')
    expect(screen.queryByRole('link', { name: 'View all campaigns' })).not.toBeInTheDocument()
  })

  it('shows campaigns-only welcome copy when the user has campaigns but no characters', async () => {
    listCampaigns.mockResolvedValue([campaign('a', 'Arden')])

    renderHome()

    const welcome = resolveDashboardWelcomeCopy({
      hasCampaigns: true,
      hasCharacters: false,
      displayName,
    })
    expect(await screen.findByRole('heading', { name: welcome.title })).toBeInTheDocument()
    expect(screen.getByText(welcome.body)).toBeInTheDocument()
  })

  it('shows characters-only welcome copy when the user has characters but no campaigns', async () => {
    listCampaigns.mockResolvedValue([])
    listCharacters.mockResolvedValue([character('char_1')])

    renderHome()

    const welcome = resolveDashboardWelcomeCopy({
      hasCampaigns: false,
      hasCharacters: true,
      displayName,
    })
    expect(await screen.findByRole('heading', { name: welcome.title })).toBeInTheDocument()
    expect(screen.getByText(welcome.body)).toBeInTheDocument()
  })

  it('shows active welcome copy when the user has both campaigns and characters', async () => {
    listCampaigns.mockResolvedValue([campaign('a', 'Arden')])
    listCharacters.mockResolvedValue([character('char_1')])

    renderHome()

    const welcome = resolveDashboardWelcomeCopy({
      hasCampaigns: true,
      hasCharacters: true,
      displayName,
    })
    expect(await screen.findByRole('heading', { name: welcome.title })).toBeInTheDocument()
    expect(screen.getByText(welcome.body)).toBeInTheDocument()
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

    await screen.findByRole('heading', {
      name: resolveDashboardWelcomeCopy({
        hasCampaigns: true,
        hasCharacters: false,
        displayName,
      }).title,
    })
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

  it('demotes the starter-card new campaign action when campaign rows exist', async () => {
    listCampaigns.mockResolvedValue([campaign('a', 'Arden')])

    renderHome()

    expect(await screen.findByRole('link', { name: 'New campaign' })).toHaveClass(
      'border-outline-button-border',
    )
  })

  it('demotes the starter-card new campaign action when only incomplete rows exist', async () => {
    listCampaigns.mockResolvedValue([
      makeCampaignListItem({
        id: 'camp_incomplete',
        identity: { name: 'Incomplete Campaign' },
        campaignRole: 'pc',
        controlledCharacterIds: [],
        viewerOnboardingState: 'incomplete',
      }),
    ])
    localStorage.setItem('rpg.selectedCampaignId', 'camp_incomplete')

    renderHome()

    expect(await screen.findByRole('link', { name: 'New campaign' })).toHaveClass(
      'border-outline-button-border',
    )
    expect(
      await screen.findByRole('link', { name: 'Continue setup for Incomplete Campaign' }),
    ).toBeInTheDocument()
  })

  it('shows a continue card for a remembered campaign with completed onboarding', async () => {
    listCampaigns.mockResolvedValue([
      campaign('camp_active', 'Active Campaign'),
      campaign('camp_other', 'Other Campaign'),
    ])
    localStorage.setItem('rpg.selectedCampaignId', 'camp_active')

    renderHome()

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Continue campaign' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Active Campaign' })).toHaveAttribute(
      'href',
      '/campaigns/camp_active',
    )
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

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Resume setup' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Continue setup for Incomplete Campaign' }),
    ).toHaveAttribute('href', '/campaigns/camp_incomplete/onboarding')
    expect(screen.queryByText('Continue campaign')).not.toBeInTheDocument()
  })
})
