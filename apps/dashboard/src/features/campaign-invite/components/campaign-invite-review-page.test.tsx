import { ApiError } from '@rpg/contracts'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

import { CampaignInviteReviewPage } from './campaign-invite-review-page'

const inviteId = 'b'.repeat(24)

const { useSession } = vi.hoisted(() => ({
  useSession: vi.fn(),
}))

const { useCampaignInviteResolution } = vi.hoisted(() => ({
  useCampaignInviteResolution: vi.fn(),
}))

const { acceptCampaignInviteById } = vi.hoisted(() => ({
  acceptCampaignInviteById: vi.fn(),
}))

const persistCampaignSelection = vi.hoisted(() => vi.fn())

vi.mock('@/features/campaign', () => ({
  usePersistCampaignSelection: () => persistCampaignSelection,
}))

import type * as ReactRouterDom from 'react-router-dom'

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

vi.mock('@/features/auth/hooks/use-session', () => ({
  useSession,
}))

vi.mock('../hooks/use-campaign-invite-resolution', () => ({
  useCampaignInviteResolution,
}))

vi.mock('../api/campaign-invite-client', () => ({
  acceptCampaignInviteById,
  resolveCampaignInviteById: vi.fn(),
  invalidateCampaignInviteAcceptQueries: vi.fn(),
}))

const authenticatedResolution = {
  inviteId,
  campaignId: 'camp_1',
  campaignName: 'The Shattered Vale',
  inviterDisplayName: 'Avery',
  status: 'pending' as const,
  expiresAt: '2026-01-08T00:00:00.000Z',
}

function renderInviteReviewPage() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CampaignInviteReviewPage inviteId={inviteId} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CampaignInviteReviewPage', () => {
  beforeEach(() => {
    navigate.mockReset()
    persistCampaignSelection.mockReset()
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'player@example.com', displayName: 'Player', role: 'user' },
        activeCampaign: null,
      },
    })
    acceptCampaignInviteById.mockReset()
  })

  it('shows an explicit accept button instead of auto-accepting', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: authenticatedResolution,
    })

    renderInviteReviewPage()

    expect(await screen.findByRole('button', { name: /accept invitation/i })).toBeInTheDocument()
    expect(acceptCampaignInviteById).not.toHaveBeenCalled()
  })

  it('accepts and navigates to onboarding when the user clicks accept', async () => {
    const user = userEvent.setup()
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: authenticatedResolution,
    })
    acceptCampaignInviteById.mockResolvedValueOnce({
      inviteId,
      campaignId: 'camp_1',
    })

    renderInviteReviewPage()

    await user.click(await screen.findByRole('button', { name: /accept invitation/i }))

    await waitFor(() => {
      expect(acceptCampaignInviteById).toHaveBeenCalledWith(inviteId)
    })
    await waitFor(() => {
      expect(persistCampaignSelection).toHaveBeenCalledWith('camp_1')
    })
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/campaigns/camp_1/onboarding')
    })
  })

  it('shows continue setup for accepted invites', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...authenticatedResolution, status: 'accepted' },
    })

    renderInviteReviewPage()

    expect(
      await screen.findByRole('button', { name: /continue to character setup/i }),
    ).toBeInTheDocument()
  })

  it('persists campaign selection and navigates to onboarding when continuing setup', async () => {
    const user = userEvent.setup()
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...authenticatedResolution, status: 'accepted' },
    })

    renderInviteReviewPage()

    await user.click(await screen.findByRole('button', { name: /continue to character setup/i }))

    expect(persistCampaignSelection).toHaveBeenCalledWith('camp_1')
    expect(navigate).toHaveBeenCalledWith('/campaigns/camp_1/onboarding')
  })

  it('links completed invites to the campaign detail page', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...authenticatedResolution, status: 'completed' },
    })

    renderInviteReviewPage()

    expect(await screen.findByRole('link', { name: /open campaign/i })).toHaveAttribute(
      'href',
      '/app/campaigns/camp_1',
    )
  })

  it('shows unavailable copy when resolution fails', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: true,
      error: new ApiError(404, 'not_found', 'Invitation not found'),
    })

    renderInviteReviewPage()

    expect(await screen.findByText(/invitation not found/i)).toBeInTheDocument()
  })

  it('shows the expired terminal state', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...authenticatedResolution, status: 'expired' },
    })

    renderInviteReviewPage()

    expect(await screen.findByText(/this invitation has expired/i)).toBeInTheDocument()
  })

  it('shows the revoked terminal state', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...authenticatedResolution, status: 'revoked' },
    })

    renderInviteReviewPage()

    expect(await screen.findByText(/no longer available/i)).toBeInTheDocument()
  })

  it('shows an error and does not retry when acceptance fails', async () => {
    const user = userEvent.setup()
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: authenticatedResolution,
    })
    acceptCampaignInviteById.mockRejectedValueOnce(
      new ApiError(403, 'forbidden', 'Invalid or missing CSRF token'),
    )

    renderInviteReviewPage()

    await user.click(await screen.findByRole('button', { name: /accept invitation/i }))

    expect(await screen.findByText(/invalid or missing csrf token/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(acceptCampaignInviteById).toHaveBeenCalledTimes(1)
    })
  })
})
