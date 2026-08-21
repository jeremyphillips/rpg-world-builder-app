import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS } from '../../../lib/overview/campaign-overview-labels'
import { CampaignOverviewMembersSection } from '../campaign-overview-members-section'

describe('CampaignOverviewMembersSection', () => {
  it('renders member rows and onboarding badges', () => {
    render(
      <CampaignOverviewMembersSection
        members={[
          {
            id: 'member_owner',
            displayName: 'Dungeon Master',
            role: 'owner',
          },
          {
            id: 'member_player',
            displayName: 'Player One',
            role: 'pc',
            onboardingState: 'onboarding_incomplete',
          },
        ]}
      />,
    )

    expect(screen.getByText('Dungeon Master')).toBeInTheDocument()
    expect(screen.getByText('Player One')).toBeInTheDocument()
    expect(
      screen.getByText(CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS.onboarding_incomplete),
    ).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CampaignOverviewMembersSection
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
