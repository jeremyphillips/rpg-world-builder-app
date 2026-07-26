import { useParams, useSearchParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'
import { useCampaignInviteOnboardingContext } from '../hooks/use-campaign-invite-onboarding-context'

/** Loads invite onboarding context after public acceptance handoff. */
export function CampaignInviteOnboarding() {
  const { campaignId: _campaignId } = useParams<{ campaignId: string }>()
  const [searchParams] = useSearchParams()
  const inviteId = searchParams.get('inviteId') ?? undefined

  const { data: context, isPending, isError, error } = useCampaignInviteOnboardingContext(inviteId)

  if (!inviteId) {
    return (
      <NarrowPage>
        <Text variant="destructive" role="alert">
          This onboarding link is missing an invitation id.
        </Text>
      </NarrowPage>
    )
  }

  return (
    <NarrowPage>
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={error?.message}
        defaultErrorLabel="Could not load campaign onboarding."
      >
        {context?.status === 'accepted' ? (
          <div className="flex flex-col gap-3">
            <Heading variant="page" as="h1">
              Join {context.campaign.name}
            </Heading>
            <Text variant="muted">
              You have joined this campaign. Character setup continues on the next step.
            </Text>
          </div>
        ) : null}
      </PageLoadState>
    </NarrowPage>
  )
}
