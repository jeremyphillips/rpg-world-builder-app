import type { CampaignInviteOnboardingContext } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { CampaignInviteOnboardingClient } from '../components/campaign-invite-onboarding.client'

export function CampaignInviteOnboardingBody({
  context,
  campaignId,
  inviteId,
}: {
  context: CampaignInviteOnboardingContext
  campaignId: string
  inviteId: string
}) {
  if (context.status !== 'accepted') return null

  if (context.campaign.id !== campaignId) {
    return (
      <Text variant="destructive" role="alert">
        This invitation does not match the campaign in the URL.
      </Text>
    )
  }

  return <CampaignInviteOnboardingClient context={context} inviteId={inviteId} />
}
