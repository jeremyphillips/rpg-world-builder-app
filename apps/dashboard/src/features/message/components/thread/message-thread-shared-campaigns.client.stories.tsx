import type { Meta, StoryObj } from '@storybook/react-vite'

import { MessageThreadSharedCampaigns } from './message-thread-shared-campaigns.client'

const meta = {
  title: 'Message/MessageThreadSharedCampaigns',
  component: MessageThreadSharedCampaigns,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MessageThreadSharedCampaigns>

export default meta

type Story = StoryObj<typeof MessageThreadSharedCampaigns>

export const TwoCampaigns: Story = {
  args: {
    sharedCampaigns: [
      { campaignId: 'camp_1', campaignName: 'Curse of Strahd' },
      { campaignId: 'camp_2', campaignName: 'Lost Mine' },
    ],
  },
}

export const OverflowCampaigns: Story = {
  args: {
    sharedCampaigns: [
      { campaignId: 'camp_1', campaignName: 'Curse of Strahd' },
      { campaignId: 'camp_2', campaignName: 'Lost Mine' },
      { campaignId: 'camp_3', campaignName: 'Storm King' },
      { campaignId: 'camp_4', campaignName: 'Tomb of Annihilation' },
    ],
  },
}
