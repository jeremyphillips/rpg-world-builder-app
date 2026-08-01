import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'

import { buttonVariants, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'

import { CAMPAIGN_ONBOARDING_UNEXPECTED_STATUS_COPY } from '../lib/campaign-onboarding-copy'
import { useCampaignOnboardingContext } from '../hooks/use-campaign-onboarding-context'
import { CampaignOnboardingBody } from './campaign-onboarding-body'

export function CampaignOnboarding() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const [searchParams] = useSearchParams()
  const initialCharacterId = searchParams.get('characterId') ?? undefined
  const { data: context, isPending, isError, error } = useCampaignOnboardingContext(campaignId)

  if (!campaignId) {
    return (
      <NarrowPage>
        <Text variant="destructive" role="alert">
          This onboarding link is missing the campaign id.
        </Text>
      </NarrowPage>
    )
  }

  if (context?.status === 'complete') {
    if (context.characterId) {
      return (
        <Navigate
          to={ROUTES.campaign.characters.detail(context.campaignId, context.characterId)}
          replace
        />
      )
    }

    return (
      <NarrowPage>
        <div className="flex flex-col gap-4">
          <Text variant="muted" role="status">
            {CAMPAIGN_ONBOARDING_UNEXPECTED_STATUS_COPY.activeWithoutCharacter.message}
          </Text>
          <Link to={ROUTES.campaign.detail(context.campaignId)} className={buttonVariants()}>
            {CAMPAIGN_ONBOARDING_UNEXPECTED_STATUS_COPY.activeWithoutCharacter.action}
          </Link>
        </div>
      </NarrowPage>
    )
  }

  return (
    <PageLoadState
      isPending={isPending}
      isError={isError}
      errorLabel={error?.message}
      defaultErrorLabel="Could not load campaign onboarding."
    >
      {context ? (
        <CampaignOnboardingBody
          context={context}
          campaignId={campaignId}
          initialCharacterId={initialCharacterId}
        />
      ) : null}
    </PageLoadState>
  )
}
