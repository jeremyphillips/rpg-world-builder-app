/**
 * @deprecated Use `campaign-onboarding.client`.
 * Thin wrapper kept for Storybook and tests during the neutral migration.
 */
import type { CampaignInviteOnboardingAcceptedContext } from '@rpg/contracts'

import { CampaignOnboardingClient } from './campaign-onboarding.client'

export function CampaignInviteOnboardingClient({
  context,
  inviteId: _inviteId,
}: {
  context: CampaignInviteOnboardingAcceptedContext
  inviteId: string
}) {
  return (
    <CampaignOnboardingClient
      campaignId={context.campaign.id}
      context={{
        status: 'onboarding_incomplete',
        campaignId: context.campaign.id,
        campaign: context.campaign,
        startingLevel: context.startingLevel,
      }}
    />
  )
}
