import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CampaignOverviewInvitationsSection } from '../campaign-overview-invitations-section'

function renderInvitations(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('CampaignOverviewInvitationsSection', () => {
  it('renders failed delivery copy without a sent line', () => {
    renderInvitations(
      <CampaignOverviewInvitationsSection
        campaignId="camp_1"
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
    expect(screen.getByText(/Email not sent · Expires/)).toBeInTheDocument()
    expect(screen.queryByText(/^Sent /)).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderInvitations(
      <CampaignOverviewInvitationsSection campaignId="camp_1" invites={[]} />,
    )
    await expectNoAxeViolations(container)
  })
})
