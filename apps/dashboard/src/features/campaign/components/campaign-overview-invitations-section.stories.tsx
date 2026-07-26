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
  args: { invites: [] },
}

export const PendingInvite: Story = {
  args: {
    invites: [
      {
        id: 'invite_1',
        email: 'player@example.com',
        status: 'pending',
        deliveryStatus: 'sent',
        expiresAt: '2026-08-02T00:00:00.000Z',
      },
    ],
  },
}

export const FailedDelivery: Story = {
  args: {
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
