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
    expect(screen.queryByText('Your campaigns')).not.toBeInTheDocument()
  })

  it('renders a picker of campaigns when the user has several', async () => {
    listCampaigns.mockResolvedValue([campaign('a', 'Arden'), campaign('b', 'Baldur')])

    renderHome()

    expect(await screen.findByText('Your campaigns')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Arden' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Baldur' })).toBeInTheDocument()
  })
})
