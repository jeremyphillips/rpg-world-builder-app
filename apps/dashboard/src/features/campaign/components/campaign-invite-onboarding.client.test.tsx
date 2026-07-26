import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { CampaignInviteOnboardingAcceptedContext } from '@rpg/contracts'

import { CampaignInviteOnboardingClient } from './campaign-invite-onboarding.client'

vi.mock('./campaign-invite-existing-character-panel.client', () => ({
  ExistingCharacterPanel: ({ onBack }: { onBack: () => void }) => (
    <div>
      <h2>Existing character branch</h2>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}))

vi.mock('./campaign-invite-new-character-panel.client', () => ({
  NewCharacterPanel: ({ onBack }: { onBack: () => void }) => (
    <div>
      <h2>New character branch</h2>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}))

const acceptedContext: CampaignInviteOnboardingAcceptedContext = {
  status: 'accepted',
  inviteId: 'invite_1',
  campaign: { id: 'camp_1', name: 'The Argent Road' },
  membership: { id: 'member_1', role: 'pc' },
  startingLevel: 1,
  expiresAt: '2026-08-02T00:00:00.000Z',
}

describe('CampaignInviteOnboardingClient', () => {
  it('branches between choice, existing, and new flows with back navigation', async () => {
    const user = userEvent.setup()
    render(<CampaignInviteOnboardingClient context={acceptedContext} inviteId="invite_1" />)

    expect(screen.getByRole('heading', { name: 'Join The Argent Road' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /use an existing character/i }))
    expect(screen.getByRole('heading', { name: 'Existing character branch' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Join The Argent Road' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /create a new character/i }))
    expect(screen.getByRole('heading', { name: 'New character branch' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Join The Argent Road' })).toBeInTheDocument()
  })
})
