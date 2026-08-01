import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { FinishJoiningCampaignCard } from './finish-joining-campaign-card.client'

const meta = {
  title: 'Campaign/FinishJoiningCampaignCard',
  component: FinishJoiningCampaignCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FinishJoiningCampaignCard>

export default meta

type Story = StoryObj<typeof FinishJoiningCampaignCard>

export const Default: Story = {
  args: {
    campaign: makeCampaignListItem({
      id: 'camp_incomplete',
      identity: { name: 'Stormwatch' },
      campaignRole: 'pc',
      controlledCharacterIds: [],
      viewerOnboardingState: 'incomplete',
    }),
  },
}
