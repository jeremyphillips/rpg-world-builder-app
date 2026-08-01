import { ApiError } from '@rpg/contracts'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CampaignInvitePage } from './campaign-invite-page.client'

const { useSession } = vi.hoisted(() => ({
  useSession: vi.fn(),
}))

const { useCampaignInviteResolution } = vi.hoisted(() => ({
  useCampaignInviteResolution: vi.fn(),
}))

const { acceptCampaignInviteByToken } = vi.hoisted(() => ({
  acceptCampaignInviteByToken: vi.fn(),
}))

vi.mock('@/features/auth/hooks/use-session', () => ({
  useSession,
}))

vi.mock('../hooks/use-campaign-invite-resolution', () => ({
  useCampaignInviteResolution,
}))

vi.mock('../api/campaign-invite-client', () => ({
  acceptCampaignInviteByToken: acceptCampaignInviteByToken,
  acceptCampaignInviteById: vi.fn(),
  resolveCampaignInviteByToken: vi.fn(),
  resolveCampaignInviteById: vi.fn(),
  invalidateCampaignInviteAcceptQueries: vi.fn(),
}))

const inviteToken = 'a'.repeat(64)

function renderInvitePage() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <CampaignInvitePage token={inviteToken} />
    </QueryClientProvider>,
  )
}

describe('CampaignInvitePage', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { assign: vi.fn() })
    useSession.mockReturnValue({ isPending: false, data: undefined })
    acceptCampaignInviteByToken.mockReset()
  })

  it('shows sign-in and sign-up links for unauthenticated pending invites', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        invitedEmailMasked: 'p***@example.com',
        status: 'pending',
        expiresAt: '2026-01-08T00:00:00.000Z',
      },
    })

    renderInvitePage()

    expect(
      await screen.findByRole('heading', { name: /invited to join the shattered vale/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      `/login?returnTo=%2Fcampaign-invites%2F${inviteToken}&email=player%40example.com`,
    )
    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute(
      'href',
      `/signup?returnTo=%2Fcampaign-invites%2F${inviteToken}&email=player%40example.com`,
    )
  })

  it('shows an explicit accept button instead of auto-accepting', async () => {
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'player@example.com', displayName: 'Player', role: 'user' },
        activeCampaign: null,
      },
    })
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        status: 'pending',
        expiresAt: '2026-01-08T00:00:00.000Z',
      },
    })

    renderInvitePage()

    expect(await screen.findByRole('button', { name: /accept invitation/i })).toBeInTheDocument()
    expect(acceptCampaignInviteByToken).not.toHaveBeenCalled()
  })

  it('accepts and redirects when the user clicks accept', async () => {
    const user = userEvent.setup()
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'player@example.com', displayName: 'Player', role: 'user' },
        activeCampaign: null,
      },
    })
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        status: 'pending',
        expiresAt: '2026-01-08T00:00:00.000Z',
      },
    })
    acceptCampaignInviteByToken.mockResolvedValueOnce({
      inviteId: 'invite_1',
      campaignId: 'camp_1',
    })

    renderInvitePage()

    await user.click(await screen.findByRole('button', { name: /accept invitation/i }))

    await waitFor(() => {
      expect(acceptCampaignInviteByToken).toHaveBeenCalledWith(inviteToken)
    })
    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/app/campaigns/camp_1/onboarding')
    })
  })

  it('shows email mismatch guidance for the wrong signed-in account', async () => {
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'other@example.com', displayName: 'Other', role: 'user' },
        activeCampaign: null,
      },
    })
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        invitedEmailMasked: 'p***@example.com',
        status: 'pending',
        expiresAt: '2026-01-01T00:00:000Z',
      },
    })

    renderInvitePage()

    expect(await screen.findByText(/use the invited account/i)).toBeInTheDocument()
    expect(screen.getByText(/p\*\*\*@example.com/i)).toBeInTheDocument()
    expect(acceptCampaignInviteByToken).not.toHaveBeenCalled()
  })

  it('links completed invites to the campaign detail page', async () => {
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'player@example.com', displayName: 'Player', role: 'user' },
        activeCampaign: null,
      },
    })
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        status: 'completed',
        expiresAt: '2026-01-01T00:00:00.000Z',
      },
    })

    renderInvitePage()

    expect(await screen.findByRole('link', { name: /open campaign/i })).toHaveAttribute(
      'href',
      '/app/campaigns/camp_1',
    )
  })

  it('shows continue setup for accepted invites', async () => {
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'player@example.com', displayName: 'Player', role: 'user' },
        activeCampaign: null,
      },
    })
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        status: 'accepted',
        expiresAt: '2026-01-08T00:00:00.000Z',
      },
    })

    renderInvitePage()

    expect(
      await screen.findByRole('button', { name: /continue to character setup/i }),
    ).toBeInTheDocument()
  })

  it('shows an error and does not retry when acceptance fails', async () => {
    const user = userEvent.setup()
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'player@example.com', displayName: 'Player', role: 'user' },
        activeCampaign: null,
      },
    })
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        status: 'pending',
        expiresAt: '2026-01-08T00:00:00.000Z',
      },
    })
    acceptCampaignInviteByToken.mockRejectedValueOnce(
      new ApiError(403, 'forbidden', 'Invalid or missing CSRF token'),
    )

    renderInvitePage()

    await user.click(await screen.findByRole('button', { name: /accept invitation/i }))

    expect(await screen.findByText(/invalid or missing csrf token/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(acceptCampaignInviteByToken).toHaveBeenCalledTimes(1)
    })
  })

  it('shows the expired terminal state', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        status: 'expired',
        expiresAt: '2026-01-01T00:00:00.000Z',
      },
    })

    renderInvitePage()

    expect(await screen.findByText(/this invitation has expired/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument()
  })

  it('shows the revoked terminal state', async () => {
    useCampaignInviteResolution.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        campaignId: 'camp_1',
        campaignName: 'The Shattered Vale',
        inviterDisplayName: 'Avery',
        invitedEmail: 'player@example.com',
        status: 'revoked',
        expiresAt: '2026-01-01T00:00:00.000Z',
      },
    })

    renderInvitePage()

    expect(await screen.findByText(/no longer available/i)).toBeInTheDocument()
  })
})
