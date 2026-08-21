import type { Meta, StoryObj } from '@storybook/react-vite'

import { toPendingInvitePromotion } from '@/features/campaign'

import { CampaignInvitationCard } from './campaign-invitation-card'

const invite = {
  inviteId: 'a'.repeat(24),
  campaignId: 'camp_1',
  campaignName: 'The Shattered Vale',
  inviterDisplayName: 'Avery',
  expiresAt: '2026-01-08T00:00:00.000Z',
}

const meta = {
  title: 'Campaign Invite/CampaignInvitationCard',
  component: CampaignInvitationCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignInvitationCard>

export default meta

type Story = StoryObj<typeof CampaignInvitationCard>

export const Default: Story = {
  args: {
    promotion: toPendingInvitePromotion(invite),
  },
}
