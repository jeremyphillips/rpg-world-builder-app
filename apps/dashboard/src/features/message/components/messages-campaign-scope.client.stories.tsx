import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import {
  MessagesCampaignScopeChrome,
  MessagesOutOfScopePin,
} from './messages-campaign-scope.client'

const meta = {
  title: 'Message/MessagesCampaignScope',
  component: MessagesCampaignScopeChrome,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MessagesCampaignScopeChrome>

export default meta

type Story = StoryObj<typeof MessagesCampaignScopeChrome>

export const ScopedWithHidden: Story = {
  args: {
    scope: { campaignId: 'camp-1', campaignName: 'Ashes of Winter' },
    scopedCount: 10,
    hiddenCount: 2,
    showInvalidScopeNotice: false,
    onDismissInvalidScopeNotice: fn(),
  },
}

export const ScopedWithoutHidden: Story = {
  args: {
    scope: { campaignId: 'camp-1', campaignName: 'Ashes of Winter' },
    scopedCount: 4,
    hiddenCount: 0,
    showInvalidScopeNotice: false,
    onDismissInvalidScopeNotice: fn(),
  },
}

export const InvalidScopeNotice: Story = {
  args: {
    showInvalidScopeNotice: true,
    onDismissInvalidScopeNotice: fn(),
  },
}

export const OutOfScopePin: StoryObj<typeof MessagesOutOfScopePin> = {
  render: (args) => <MessagesOutOfScopePin {...args} />,
  args: {
    campaignName: 'Ashes of Winter',
    campaignId: 'camp-1',
    conversationId: 'conversation-1',
    peerDisplayName: 'Campaign Member',
    isActive: true,
  },
}
