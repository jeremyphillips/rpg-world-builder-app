/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const mutateAsync = vi.hoisted(() => vi.fn())

vi.mock('../hooks/use-send-campaign-invite', () => ({
  useSendCampaignInvite: () => ({
    mutateAsync,
    isPending: false,
    isSuccess: false,
  }),
}))

import { InviteMemberDialog } from '../components/overview/invite-member-dialog'

describe('campaign invite runner adoption', () => {
  it('blocks empty email through runner evaluation before persist', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog campaignId="camp-1" open showTrigger={false} />)

    await user.click(screen.getByRole('button', { name: /send invitation/i }))
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
