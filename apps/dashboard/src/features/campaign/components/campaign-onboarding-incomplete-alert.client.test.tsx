import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import { CampaignOnboardingIncompleteAlert } from './campaign-onboarding-incomplete-alert.client'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

const incompleteCampaign = makeCampaignListItem({
  id: 'camp_1',
  identity: { name: 'Stormwatch' },
  campaignRole: 'pc',
  controlledCharacterIds: [],
  viewerState: VIEWER_STATE.onboardingIncomplete,
})

describe('CampaignOnboardingIncompleteAlert', () => {
  it('renders finish joining copy and onboarding CTA', () => {
    render(<CampaignOnboardingIncompleteAlert campaign={incompleteCampaign} />)

    expect(screen.getByText('Finish joining Stormwatch')).toBeInTheDocument()
    expect(
      screen.getByText('Create or connect a character to complete your campaign setup.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue setup' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/onboarding',
    )
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CampaignOnboardingIncompleteAlert campaign={incompleteCampaign} />,
    )

    await expectNoAxeViolations(container)
  })
})
