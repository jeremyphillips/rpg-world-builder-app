import type { Meta, StoryObj } from '@storybook/react-vite'

import type { CampaignInviteOnboardingAcceptedContext } from '@rpg/contracts'

import { CampaignInviteOnboardingClient } from './campaign-invite-onboarding.client'

const acceptedContext: CampaignInviteOnboardingAcceptedContext = {
  status: 'accepted',
  inviteId: 'invite_1',
  campaign: { id: 'camp_1', name: 'The Argent Road' },
  membership: { id: 'member_1', role: 'pc' },
  startingLevel: 1,
  expiresAt: '2026-08-02T00:00:00.000Z',
}

const meta = {
  title: 'Campaign/CampaignInviteOnboarding',
  component: CampaignInviteOnboardingClient,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignInviteOnboardingClient>

export default meta
type Story = StoryObj<typeof CampaignInviteOnboardingClient>

export const Choice: Story = {
  args: {
    context: acceptedContext,
    inviteId: 'invite_1',
  },
}
