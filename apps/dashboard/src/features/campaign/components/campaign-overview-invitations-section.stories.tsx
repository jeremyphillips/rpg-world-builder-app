import type { Meta, StoryObj } from '@storybook/react-vite'

import { CampaignOverviewInvitationsSection } from './campaign-overview-invitations-section'

const meta = {
  title: 'Campaign/CampaignOverviewInvitationsSection',
  component: CampaignOverviewInvitationsSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignOverviewInvitationsSection>

export default meta
type Story = StoryObj<typeof CampaignOverviewInvitationsSection>

export const Empty: Story = {
  args: { campaignId: 'camp_1', invites: [] },
}

export const PendingInvite: Story = {
  args: {
    campaignId: 'camp_1',
    invites: [
      {
        id: 'invite_1',
        email: 'player@example.com',
        status: 'pending',
        deliveryStatus: 'sent',
        sentAt: '2026-07-25T12:00:00.000Z',
        expiresAt: '2026-08-02T00:00:00.000Z',
      },
    ],
  },
}

export const FailedDelivery: Story = {
  args: {
    campaignId: 'camp_1',
    invites: [
      {
        id: 'invite_2',
        email: 'player@example.com',
        status: 'pending',
        deliveryStatus: 'failed',
        expiresAt: '2026-08-02T00:00:00.000Z',
      },
    ],
  },
}
