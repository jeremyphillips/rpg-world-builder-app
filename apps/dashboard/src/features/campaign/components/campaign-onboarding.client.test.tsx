import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { CampaignOnboardingIncompleteContext } from '@rpg/contracts'

import { CampaignOnboardingClient } from './campaign-onboarding.client'

vi.mock('./campaign-onboarding-existing-character-panel.client', () => ({
  CampaignOnboardingExistingCharacterPanel: ({ onBack }: { onBack: () => void }) => (
    <div>
      <h2>Existing character branch</h2>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}))

vi.mock('./campaign-onboarding-new-character-panel.client', () => ({
  CampaignOnboardingNewCharacterPanel: ({ onBack }: { onBack: () => void }) => (
    <div>
      <h2>New character branch</h2>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}))

const incompleteContext: CampaignOnboardingIncompleteContext = {
  status: 'onboarding_incomplete',
  mode: 'initial',
  campaignId: 'camp_1',
  campaign: { id: 'camp_1', name: 'The Argent Road' },
  startingLevel: 1,
}

describe('CampaignOnboardingClient', () => {
  it('branches between choice, existing, and new flows with back navigation', async () => {
    const user = userEvent.setup()
    render(<CampaignOnboardingClient context={incompleteContext} campaignId="camp_1" />)

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
