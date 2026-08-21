import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CampaignOnboardingIncompleteContext } from '@rpg/contracts'

import { withDashboardProviders } from '../../../../../.storybook/decorators'

import { CampaignOnboardingNewCharacterPanel } from './campaign-onboarding-new-character-panel'

const incompleteContext: CampaignOnboardingIncompleteContext = {
  status: 'onboarding_incomplete',
  mode: 'initial',
  campaignId: 'camp_1',
  campaign: { id: 'camp_1', name: 'The Argent Road' },
  startingLevel: 1,
}

const meta = {
  title: 'Campaign/CampaignOnboardingNewCharacterPanel',
  component: CampaignOnboardingNewCharacterPanel,
  parameters: { layout: 'fullscreen' },
  decorators: [withDashboardProviders],
  args: {
    context: incompleteContext,
    campaignId: 'camp_1',
    onBack: () => undefined,
  },
} satisfies Meta<typeof CampaignOnboardingNewCharacterPanel>

export default meta

type Story = StoryObj<typeof CampaignOnboardingNewCharacterPanel>

export const Loading: Story = {}
