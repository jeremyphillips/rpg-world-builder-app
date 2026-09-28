import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS } from '../../../lib/overview/campaign-overview-labels'
import { CampaignOverviewMembersSection } from '../campaign-overview-members-section'

function renderMembers(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('CampaignOverviewMembersSection', () => {
  it('renders member rows and onboarding badges', () => {
    renderMembers(
      <CampaignOverviewMembersSection
        campaignId="camp_1"
        members={[
          {
            id: 'member_owner',
            displayName: 'Dungeon Master',
            role: 'owner',
          },
          {
            id: 'member_player',
            displayName: 'Player One',
            avatarKey: 'avatars/player-one.png',
            role: 'pc',
            onboardingState: 'onboarding_incomplete',
          },
        ]}
      />,
    )

    expect(screen.getByText('Dungeon Master')).toBeInTheDocument()
    expect(screen.getByText('Player One')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Player One' })).toHaveAttribute(
      'src',
      '/api/uploads/avatars/player-one.png',
    )
    expect(
      document.querySelector('[data-detail-row-leading-media][data-shape="circle"]'),
    ).toBeTruthy()
    expect(
      screen.getByText(CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS.onboarding_incomplete),
    ).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderMembers(
      <CampaignOverviewMembersSection
        campaignId="camp_1"
        members={[
          {
            id: 'member_player',
            displayName: 'Player One',
            role: 'pc',
            onboardingState: 'character_added',
          },
        ]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
