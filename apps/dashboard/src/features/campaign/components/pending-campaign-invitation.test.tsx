import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { PendingCampaignInvitation } from './pending-campaign-invitation.client'

const invite = {
  inviteId: 'a'.repeat(24),
  campaignId: 'camp_1',
  campaignName: 'The Shattered Vale',
  inviterDisplayName: 'Avery',
  expiresAt: '2026-01-08T00:00:00.000Z',
}

describe('PendingCampaignInvitation', () => {
  it('uses an anchor review CTA on the card variant', () => {
    render(<PendingCampaignInvitation invite={invite} variant="card" />)

    expect(screen.getByRole('link', { name: 'Review invitation' })).toHaveAttribute(
      'href',
      `/app/campaign-invites/${invite.inviteId}`,
    )
  })

  it('uses an anchor row on the compact list variant', () => {
    render(<PendingCampaignInvitation invite={invite} variant="compactList" />)

    expect(
      screen.getByRole('link', { name: 'Review invitation to The Shattered Vale' }),
    ).toHaveAttribute('href', `/app/campaign-invites/${invite.inviteId}`)
  })
})
