import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import { toRecoveryPromotion } from '../../lib/recovery/campaign-recovery-promotions.lib'
import { CampaignRecoveryPromotionCard } from './campaign-recovery-promotion-card'

describe('CampaignRecoveryPromotionCard', () => {
  it('renders finish joining as a comfortable Card without live region', () => {
    const promotion = toRecoveryPromotion(
      makeCampaignListItem({
        id: 'camp_incomplete',
        identity: { name: 'Stormwatch' },
        viewerState: VIEWER_STATE.onboardingIncomplete,
      }),
    )

    const { container } = render(
      <MemoryRouter>
        <CampaignRecoveryPromotionCard promotion={promotion} />
      </MemoryRouter>,
    )

    expect(container.querySelector('.ui-card--comfortable')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('link', { name: 'Continue setup' })).toHaveAttribute(
      'href',
      '/campaigns/camp_incomplete/onboarding',
    )
  })

  it('renders reconnect as a warning Alert without announcement role', () => {
    const promotion = toRecoveryPromotion(
      makeCampaignListItem({
        id: 'camp_stale',
        identity: { name: 'Stormwatch' },
        viewerState: VIEWER_STATE.controlStale('char_1'),
      }),
    )

    render(
      <MemoryRouter>
        <CampaignRecoveryPromotionCard promotion={promotion} />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('alert')).toBeNull()
    expect(
      screen.getByText('Stormwatch — connection needs restore').closest('.ui-alert--warning'),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Reconnect character' })).toHaveAttribute(
      'href',
      '/campaigns/camp_stale/onboarding?mode=reconnect&characterId=char_1',
    )
  })
})
