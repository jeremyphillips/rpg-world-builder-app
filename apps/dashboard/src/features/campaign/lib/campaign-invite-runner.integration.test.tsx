/**
 * @vitest-environment jsdom
 *
 * Production entry: InviteMemberDialog producerBoundary={ProducerBoundary} via useRunnerFormSubmit.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

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
  it('blocks persist through producer-backed runner evaluation before persist', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog campaignId="camp-1" open showTrigger={false} />)

    await user.click(screen.getByRole('button', { name: /send invitation/i }))

    await waitFor(() => {
      expect(mutateAsync).not.toHaveBeenCalled()
    })
  })
})
