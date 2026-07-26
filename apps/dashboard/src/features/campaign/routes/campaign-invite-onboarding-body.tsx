import type { CampaignInviteOnboardingContext } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'

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
      <NarrowPage>
        <Text variant="destructive" role="alert">
          This invitation does not match the campaign in the URL.
        </Text>
      </NarrowPage>
    )
  }

  return <CampaignInviteOnboardingClient context={context} inviteId={inviteId} />
}
