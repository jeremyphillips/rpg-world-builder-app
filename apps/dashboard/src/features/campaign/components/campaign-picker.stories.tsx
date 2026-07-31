import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CampaignPicker } from './campaign-picker'

const meta = {
  title: 'Campaign/CampaignPicker',
  component: CampaignPicker,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignPicker>

export default meta

type Story = StoryObj<typeof CampaignPicker>

export const ActiveCampaign: Story = {
  args: {
    campaigns: [makeCampaignListItem({ identity: { name: 'The Argent Road' } })],
  },
}

export const IncompleteOnboarding: Story = {
  args: {
    campaigns: [
      makeCampaignListItem({
        id: 'camp_incomplete',
        identity: { name: 'Incomplete Campaign' },
        campaignRole: 'pc',
        controlledCharacterIds: [],
        viewerOnboardingState: 'incomplete',
      }),
    ],
  },
}

export const MultipleCampaigns: Story = {
  args: {
    campaigns: [
      makeCampaignListItem({ id: 'camp_1', identity: { name: 'The Argent Road' } }),
      makeCampaignListItem({
        id: 'camp_2',
        identity: { name: 'Stormwatch' },
        campaignRole: 'pc',
        controlledCharacterIds: [],
        viewerOnboardingState: 'incomplete',
      }),
    ],
  },
}
