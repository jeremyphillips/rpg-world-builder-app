import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { InviteMemberDialog } from './invite-member-dialog.client'

const mutateAsync = vi.fn()

vi.mock('../hooks/use-send-campaign-invite', () => ({
  useSendCampaignInvite: () => ({
    mutateAsync,
    isPending: false,
    isSuccess: false,
  }),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

function renderDialog() {
  return render(
    <QueryClientProvider client={queryClient}>
      <InviteMemberDialog campaignId="camp_1" />
    </QueryClientProvider>,
  )
}

describe('InviteMemberDialog', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Invite member' }))

    expect(screen.getByRole('heading', { name: 'Invite member' })).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('submits a valid email and closes on successful delivery', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValueOnce({ invite: { deliveryStatus: 'sent' } })
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Invite member' }))
    await user.type(screen.getByLabelText('Email address'), 'player@example.com')
    await user.click(screen.getByRole('button', { name: 'Send invitation' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('player@example.com')
    })
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Invite member' })).not.toBeInTheDocument()
    })
  })

  it('shows delivery failure copy without closing the modal', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValueOnce({ invite: { deliveryStatus: 'failed' } })
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Invite member' }))
    await user.type(screen.getByLabelText('Email address'), 'player@example.com')
    await user.click(screen.getByRole('button', { name: 'Send invitation' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Invitation saved, but the email could not be sent.',
      }),
    ).toBeInTheDocument()
  })
})
