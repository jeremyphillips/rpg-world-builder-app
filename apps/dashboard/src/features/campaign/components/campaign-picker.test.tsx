import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CampaignPicker } from './campaign-picker'

describe('CampaignPicker', () => {
  it('renders continue setup for incomplete PC memberships', () => {
    renderWithProviders(
      <CampaignPicker
        campaigns={[
          makeCampaignListItem({
            id: 'camp_1',
            identity: { name: 'Incomplete Campaign' },
            campaignRole: 'pc',
            controlledCharacterIds: [],
          }),
        ]}
        onSelect={() => undefined}
      />,
    )

    expect(screen.getByText('Character setup incomplete')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue setup' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/onboarding',
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <CampaignPicker
        campaigns={[makeCampaignListItem({ identity: { name: 'Active Campaign' } })]}
        onSelect={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
