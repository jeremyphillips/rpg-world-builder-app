import type { CampaignOnboardingContext } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'

import { CampaignOnboardingClient } from '../components/campaign-onboarding.client'

export function CampaignOnboardingBody({
  context,
  campaignId,
}: {
  context: CampaignOnboardingContext
  campaignId: string
}) {
  if (context.status !== 'onboarding_incomplete') return null

  if (context.campaign.id !== campaignId) {
    return (
      <NarrowPage>
        <Text variant="destructive" role="alert">
          This onboarding session does not match the campaign in the URL.
        </Text>
      </NarrowPage>
    )
  }

  return <CampaignOnboardingClient context={context} campaignId={campaignId} />
}
