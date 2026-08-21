import type { Meta, StoryObj } from '@storybook/react-vite'

import { MessagesEntryLinks } from './messages-entry-links'

const meta = {
  title: 'Dashboard/Message/MessagesEntryLinks',
  component: MessagesEntryLinks,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MessagesEntryLinks>

export default meta

type Story = StoryObj<typeof meta>

export const GlobalNavInline: Story = {
  args: {
    layout: 'inline',
  },
}

export const CampaignNavInline: Story = {
  args: {
    campaignId: 'camp_1',
    layout: 'inline',
  },
}

export const CampaignOverviewInline: Story = {
  args: {
    campaignId: 'camp_1',
    tone: 'overview',
    layout: 'inline',
  },
}

export const CampaignNavStacked: Story = {
  args: {
    campaignId: 'camp_1',
    layout: 'stacked',
  },
}
