import type { Meta, StoryObj } from '@storybook/react-vite'

import { MessageThreadHeader } from './message-thread-header.client'

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
    sharedCampaignCount: 1,
  },
}

export const MultipleSharedCampaigns: Story = {
  args: {
    peerDisplayName: 'Dungeon Master',
    sharedCampaignCount: 3,
  },
}

export const NoSharedCampaigns: Story = {
  args: {
    peerDisplayName: 'Quiet Peer',
    sharedCampaignCount: 0,
  },
}
