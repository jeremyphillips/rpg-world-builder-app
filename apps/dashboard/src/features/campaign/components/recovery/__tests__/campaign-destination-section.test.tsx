/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CAMPAIGN_DESTINATION_COPY } from '../../../lib/recovery/campaign-destination-copy'
import { CampaignDestinationSection } from '../campaign-destination-section'
import { PendingCampaignInvitationsSection } from '../pending-campaign-invitations-section'

const pendingInvite = {
  inviteId: 'a'.repeat(24),
  campaignId: 'camp_1',
  campaignName: 'The Shattered Vale',
  inviterDisplayName: 'Avery',
  expiresAt: '2026-01-08T00:00:00.000Z',
}

describe('CampaignDestinationSection', () => {
  it('publishes spacious density on the destination list', () => {
    const { container } = renderWithProviders(
      <CampaignDestinationSection
        eyebrow={CAMPAIGN_DESTINATION_COPY.continueCampaignEyebrow}
        campaigns={[makeCampaignListItem({ identity: { name: 'Shattered Vale' } })]}
      />,
    )

    const list = container.querySelector('ul')
    expect(list).toHaveClass('ui-destination-list--spacious')
    expect(list).not.toHaveClass('ui-destination-list--comfortable')
  })

  it('renders embedded anatomy without a redundant density modifier class', () => {
    const { container } = renderWithProviders(
      <CampaignDestinationSection
        eyebrow={CAMPAIGN_DESTINATION_COPY.yourCampaignsEyebrow}
        campaigns={[makeCampaignListItem({ identity: { name: 'Shattered Vale' } })]}
      />,
    )

    const anatomy = container.querySelector('.dash-entity-anatomy')
    expect(anatomy).toBeTruthy()
    expect(anatomy).not.toHaveClass('dash-entity-anatomy--spacious')
    expect(anatomy).not.toHaveClass('dash-entity-anatomy--comfortable')
    expect(anatomy).not.toHaveClass('dash-entity-anatomy--compact')
  })

  it('wraps destination supporting copy', () => {
    renderWithProviders(
      <CampaignDestinationSection
        eyebrow={CAMPAIGN_DESTINATION_COPY.yourCampaignsEyebrow}
        campaigns={[
          makeCampaignListItem({
            identity: { name: 'Shattered Vale' },
            status: 'active',
            campaignRole: 'owner',
            playerMemberCount: 4,
            openPcCount: 4,
          }),
        ]}
      />,
    )

    const supporting = screen.getByText(/4 players/).closest('.ui-identity-row__supporting')
    expect(supporting).toHaveClass('ui-identity-row__supporting--wrap')
    expect(supporting).not.toHaveClass('ui-identity-row__supporting--truncate')
  })
})

describe('PendingCampaignInvitationsSection index list', () => {
  it('uses comfortable density on the invitation destination list', () => {
    const { container } = renderWithProviders(
      <PendingCampaignInvitationsSection surface="index" invites={[pendingInvite]} />,
    )

    const list = container.querySelector('ul')
    expect(list).toHaveClass('ui-destination-list--comfortable')
    expect(list).not.toHaveClass('ui-destination-list--spacious')
  })
})
