import type { Meta, StoryObj } from '@storybook/react-vite'

import { MessageThreadHeader } from '../message-thread-header'

const meta = {
  title: 'Message/MessageThreadHeader',
  component: MessageThreadHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MessageThreadHeader>

export default meta

type Story = StoryObj<typeof MessageThreadHeader>

export const SingleSharedCampaign: Story = {
  args: {
    peerDisplayName: 'Campaign Member',
    sharedCampaigns: [{ campaignId: 'camp_1', campaignName: 'Curse of Strahd' }],
  },
}

export const MultipleSharedCampaigns: Story = {
  args: {
    peerDisplayName: 'Dungeon Master',
    sharedCampaigns: [
      { campaignId: 'camp_1', campaignName: 'Curse of Strahd' },
      { campaignId: 'camp_2', campaignName: 'Lost Mine' },
      { campaignId: 'camp_3', campaignName: 'Storm King' },
    ],
  },
}

export const NoSharedCampaigns: Story = {
  args: {
    peerDisplayName: 'Quiet Peer',
    sharedCampaigns: [],
  },
}
