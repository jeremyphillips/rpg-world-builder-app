import { Navigate, useParams, useSearchParams } from 'react-router-dom'

import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'

import { useCampaignInviteOnboardingContext } from '../hooks/use-campaign-invite-onboarding-context'
import { CampaignInviteOnboardingBody } from './campaign-invite-onboarding-body'

export function CampaignInviteOnboarding() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const [searchParams] = useSearchParams()
  const inviteId = searchParams.get('inviteId') ?? undefined

  const { data: context, isPending, isError, error } = useCampaignInviteOnboardingContext(inviteId)

  if (!inviteId || !campaignId) {
    return (
      <NarrowPage>
        <Text variant="destructive" role="alert">
          This onboarding link is missing required parameters.
        </Text>
      </NarrowPage>
    )
  }

  if (context?.status === 'completed') {
    return (
      <Navigate
        to={ROUTES.campaign.characters.detail(context.campaignId, context.characterId)}
        replace
      />
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
        <CampaignInviteOnboardingBody
          context={context}
          campaignId={campaignId}
          inviteId={inviteId}
        />
      ) : null}
    </PageLoadState>
  )
}
