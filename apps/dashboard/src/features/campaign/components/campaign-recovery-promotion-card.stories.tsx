import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { toRecoveryPromotion } from '../lib/campaign-recovery-promotions.lib'
import { CampaignRecoveryPromotionCard } from './campaign-recovery-promotion-card.client'

const meta = {
  title: 'Campaign/CampaignRecoveryPromotionCard',
  component: CampaignRecoveryPromotionCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignRecoveryPromotionCard>

export default meta

type Story = StoryObj<typeof CampaignRecoveryPromotionCard>

export const FinishJoining: Story = {
  args: {
    promotion: toRecoveryPromotion(
      makeCampaignListItem({
        id: 'camp_incomplete',
        identity: { name: 'Stormwatch' },
        campaignRole: 'pc',
        controlledCharacterIds: [],
        viewerOnboardingState: 'incomplete',
      }),
    ),
  },
}

export const ParticipationInvalid: Story = {
  args: {
    promotion: toRecoveryPromotion(
      makeCampaignListItem({
        id: 'camp_invalid',
        identity: { name: 'Stormwatch' },
        campaignRole: 'pc',
        controlledCharacterIds: ['char_stale'],
        viewerOnboardingState: 'invalid',
      }),
    ),
  },
}
