import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

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

describe('CampaignOnboardingIncompleteAlert', () => {
  it('renders warning copy and onboarding CTA', () => {
    render(<CampaignOnboardingIncompleteAlert campaignId="camp_1" />)

    expect(screen.getByText('Character setup incomplete')).toBeInTheDocument()
    expect(
      screen.getByText('Complete your character setup to finish joining this campaign.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue setup' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/onboarding',
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<CampaignOnboardingIncompleteAlert campaignId="camp_1" />)

    await expectNoAxeViolations(container)
  })
})
