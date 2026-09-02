import type { Meta, StoryObj } from '@storybook/react-vite'

import type { CampaignOnboardingIncompleteContext } from '@rpg/contracts'

import { CampaignOnboardingClient } from '../campaign-onboarding'

const incompleteContext: CampaignOnboardingIncompleteContext = {
  status: 'onboarding_incomplete',
  mode: 'initial',
  campaignId: 'camp_1',
  campaign: { id: 'camp_1', name: 'The Argent Road' },
  startingLevel: 1,
}

const meta = {
  title: 'Campaign/CampaignOnboarding',
  component: CampaignOnboardingClient,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignOnboardingClient>

export default meta

type Story = StoryObj<typeof CampaignOnboardingClient>

export const Choice: Story = {
  args: {
    context: incompleteContext,
    campaignId: 'camp_1',
  },
}
