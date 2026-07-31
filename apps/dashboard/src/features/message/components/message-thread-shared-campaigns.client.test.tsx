import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'

import { MessageThreadSharedCampaigns } from './message-thread-shared-campaigns.client'
import { MESSAGES_A11Y_COPY } from '../lib/messages-copy'

describe('MessageThreadSharedCampaigns', () => {
  it('renders a campaign icon and comma-separated linked campaign names', () => {
    const { container } = renderWithProviders(
      <MessageThreadSharedCampaigns
        sharedCampaigns={[
          { campaignId: 'camp_1', campaignName: 'Curse of Strahd' },
          { campaignId: 'camp_2', campaignName: 'Lost Mine' },
        ]}
      />,
    )

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Curse of Strahd' })).toHaveAttribute(
      'href',
      ROUTES.campaign.detail('camp_1'),
    )
    expect(screen.getByRole('link', { name: 'Lost Mine' })).toHaveAttribute(
      'href',
      ROUTES.campaign.detail('camp_2'),
    )
    expect(container.textContent).toContain('Curse of Strahd, Lost Mine')
  })

  it('renders an overflow trigger with a plain-text tooltip for three or more campaigns', () => {
    renderWithProviders(
      <MessageThreadSharedCampaigns
        sharedCampaigns={[
          { campaignId: 'camp_1', campaignName: 'Curse of Strahd' },
          { campaignId: 'camp_2', campaignName: 'Lost Mine' },
          { campaignId: 'camp_3', campaignName: 'Storm King' },
        ]}
      />,
    )

    expect(
      screen.getByRole('button', { name: MESSAGES_A11Y_COPY.showMoreSharedCampaigns(1) }),
    ).toHaveTextContent('+1 more')
    expect(screen.queryByRole('link', { name: 'Storm King' })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <MessageThreadSharedCampaigns
        sharedCampaigns={[
          { campaignId: 'camp_1', campaignName: 'Curse of Strahd' },
          { campaignId: 'camp_2', campaignName: 'Lost Mine' },
          { campaignId: 'camp_3', campaignName: 'Storm King' },
        ]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
