import type { Meta, StoryObj } from '@storybook/react-vite'

import { CampaignOverviewMembersSection } from '../campaign-overview-members-section'

const meta = {
  title: 'Campaign/CampaignOverviewMembersSection',
  component: CampaignOverviewMembersSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignOverviewMembersSection>

export default meta
type Story = StoryObj<typeof CampaignOverviewMembersSection>

export const WithOwnerOnly: Story = {
  args: {
    members: [
      {
        id: 'member_owner',
        displayName: 'Dungeon Master',
        role: 'owner',
      },
    ],
  },
}

export const WithIncompletePlayer: Story = {
  args: {
    members: [
      {
        id: 'member_owner',
        displayName: 'Dungeon Master',
        role: 'owner',
      },
      {
        id: 'member_player',
        displayName: 'Player One',
        role: 'pc',
        onboardingState: 'onboarding_incomplete',
      },
    ],
  },
}
