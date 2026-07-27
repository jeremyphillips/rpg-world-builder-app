import { Navigate, useParams } from 'react-router-dom'

import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'

import { useCampaignOnboardingContext } from '../hooks/use-campaign-onboarding-context'
import { CampaignOnboardingBody } from './campaign-onboarding-body'

export function CampaignOnboarding() {
  const { campaignId } = useParams<{ campaignId: string }>()
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

    return <Navigate to={ROUTES.campaign.detail(context.campaignId)} replace />
  }

  return (
    <PageLoadState
      isPending={isPending}
      isError={isError}
      errorLabel={error?.message}
      defaultErrorLabel="Could not load campaign onboarding."
    >
      {context ? <CampaignOnboardingBody context={context} campaignId={campaignId} /> : null}
    </PageLoadState>
  )
}

/** @deprecated Use {@link CampaignOnboarding}. */
export { CampaignOnboarding as CampaignInviteOnboarding }
