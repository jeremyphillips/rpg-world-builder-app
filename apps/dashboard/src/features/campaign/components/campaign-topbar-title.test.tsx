import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CAMPAIGN_DISPLAY_FALLBACK_NAME } from '../lib/campaign-display'
import { campaignTopbarTitleLinkClasses } from './campaign-topbar-title.variants'
import {
  CampaignTopbarTitle,
  CampaignTopbarTitleMissing,
  CampaignTopbarTitleSkeleton,
} from './campaign-topbar-title'

describe('CampaignTopbarTitle', () => {
  it('renders a linked campaign title with truncation layout classes', () => {
    render(
      <MemoryRouter>
        <CampaignTopbarTitle campaignId="camp_1" name="The Argent Road" href="/campaigns/camp_1" />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'The Argent Road' })
    expect(link).toHaveAttribute('href', '/campaigns/camp_1')
    expect(link).toHaveClass('min-w-0', 'text-foreground-subtle')
    expect(link.querySelector('.truncate')).toBeTruthy()
    expect(link.querySelector('[aria-hidden="true"]')).toHaveClass(
      'shrink-0',
      'text-foreground-subtle',
    )
  })

  it('renders the fallback name for missing campaigns', () => {
    render(
      <MemoryRouter>
        <CampaignTopbarTitleMissing campaignId="camp_missing" href="/campaigns/camp_missing" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: CAMPAIGN_DISPLAY_FALLBACK_NAME })).toHaveAttribute(
      'href',
      '/campaigns/camp_missing',
    )
  })

  it('renders a fixed-width skeleton without visible text', () => {
    const { container } = render(<CampaignTopbarTitleSkeleton />)

    const skeleton = container.querySelector('[aria-hidden="true"]')
    expect(skeleton).toHaveClass('min-w-0')
    expect(skeleton?.querySelector('.animate-pulse')).toBeTruthy()
    expect(screen.queryByText(CAMPAIGN_DISPLAY_FALLBACK_NAME)).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CampaignTopbarTitle campaignId="camp_1" name="The Argent Road" href="/campaigns/camp_1" />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })

  it('exports link layout classes for the topbar title cluster', () => {
    expect(campaignTopbarTitleLinkClasses).toBe('min-w-0')
  })
})
