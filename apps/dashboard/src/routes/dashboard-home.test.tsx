import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { Campaign, SessionUser } from '@rpg/contracts'

const { fetchSession } = vi.hoisted(() => ({ fetchSession: vi.fn() }))
const { listCampaigns } = vi.hoisted(() => ({ listCampaigns: vi.fn() }))

vi.mock('@/features/auth/api/auth-client', () => ({
  fetchSession,
  logout: vi.fn(),
  LOGIN_PATH: '/login',
}))

vi.mock('@/features/campaign/api/campaign-client', () => ({
  listCampaigns,
  createCampaign: vi.fn(),
  rememberSelectedCampaign: vi.fn(),
}))

import { DashboardHome } from './dashboard-home'

const user: SessionUser = {
  id: 'u1',
  email: 'dm@example.com',
  displayName: 'Dungeon Master',
  role: 'user',
  lastSelectedCampaignId: null,
}

function campaign(id: string, name: string): Campaign {
  return {
    id,
    identity: { name },
    configuration: {},
    status: 'draft',
    visibility: 'private',
    createdBy: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <DashboardHome />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardHome', () => {
  beforeEach(() => {
    fetchSession.mockReset()
    listCampaigns.mockReset()
    localStorage.clear()
    fetchSession.mockResolvedValue(user)
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
