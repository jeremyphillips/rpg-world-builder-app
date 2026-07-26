import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CampaignOverviewInvitationsSection } from './campaign-overview-invitations-section'

describe('CampaignOverviewInvitationsSection', () => {
  it('renders failed delivery copy without calling the invite sent', () => {
    render(
      <CampaignOverviewInvitationsSection
        invites={[
          {
            id: 'invite_1',
            email: 'player@example.com',
            status: 'pending',
            deliveryStatus: 'failed',
            expiresAt: '2026-08-02T00:00:00.000Z',
          },
        ]}
      />,
    )

    expect(screen.getByText('player@example.com')).toBeInTheDocument()
    expect(screen.getByText('Email not sent · Invitation pending')).toBeInTheDocument()
    expect(screen.queryByText(/Sent/)).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<CampaignOverviewInvitationsSection invites={[]} />)
    await expectNoAxeViolations(container)
  })
})
