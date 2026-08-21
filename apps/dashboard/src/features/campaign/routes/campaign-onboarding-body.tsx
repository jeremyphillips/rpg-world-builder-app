import { Link } from 'react-router-dom'

import type { CampaignOnboardingContext } from '@rpg/contracts'
import { buttonVariants, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'

import { CAMPAIGN_ONBOARDING_UNEXPECTED_STATUS_COPY } from '../lib/onboarding/campaign-onboarding-copy'
import { CampaignOnboardingClient } from '../components/onboarding/campaign-onboarding.client'

export function CampaignOnboardingBody({
  context,
  campaignId,
  initialCharacterId,
}: {
  context: CampaignOnboardingContext
  campaignId: string
  initialCharacterId?: string
}) {
  if (context.status === 'complete') {
    return (
      <NarrowPage>
        <div className="flex flex-col gap-4">
          <Text variant="muted" role="status">
            {CAMPAIGN_ONBOARDING_UNEXPECTED_STATUS_COPY.complete.message}
          </Text>
          <Link to={ROUTES.campaign.detail(context.campaignId)} className={buttonVariants()}>
            {CAMPAIGN_ONBOARDING_UNEXPECTED_STATUS_COPY.complete.action}
          </Link>
        </div>
      </NarrowPage>
    )
  }

  if (context.campaign.id !== campaignId) {
    return (
      <NarrowPage>
        <Text variant="destructive" role="alert">
          This onboarding session does not match the campaign in the URL.
        </Text>
      </NarrowPage>
    )
  }

  return (
    <CampaignOnboardingClient
      context={context}
      campaignId={campaignId}
      initialCharacterId={initialCharacterId}
    />
  )
}
