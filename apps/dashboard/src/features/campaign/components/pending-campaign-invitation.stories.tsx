import type { Meta, StoryObj } from '@storybook/react-vite'

import { PendingCampaignInvitation } from './pending-campaign-invitation.client'

const invite = {
  inviteId: 'a'.repeat(24),
  campaignId: 'camp_1',
  campaignName: 'The Shattered Vale',
  inviterDisplayName: 'Avery',
  expiresAt: '2026-01-08T00:00:00.000Z',
}

const meta = {
  title: 'Campaign/PendingCampaignInvitation',
  component: PendingCampaignInvitation,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PendingCampaignInvitation>

export default meta

type Story = StoryObj<typeof PendingCampaignInvitation>

export const CompactList: Story = {
  args: {
    invite,
  },
}
