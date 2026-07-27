'use client'

import { useState } from 'react'

import type {
  CampaignInviteOnboardingAcceptedContext,
  CampaignInviteUnavailableReason,
} from '@rpg/contracts'
import { Heading, Text, Button } from '@rpg/ui'

import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { useSession } from '@/features/auth'
import { CharacterBuilderShell } from '@/features/character/components/character-builder-shell.client'
import { useCampaignInvitePcBuildContext } from '@/features/character/hooks/use-campaign-build-context'

import { formatInviteUnavailableMessage } from '../lib/campaign-invite-unavailable-display'

export function NewCharacterPanel({
  context,
  inviteId,
  onBack,
}: {
  context: CampaignInviteOnboardingAcceptedContext
  inviteId: string
  onBack: () => void
}) {
  const { data: session } = useSession()
  const [inviteUnavailableReason, setInviteUnavailableReason] =
    useState<CampaignInviteUnavailableReason | null>(null)
  const {
    context: buildContext,
    catalogIndex,
    isPending,
    isError,
    error,
  } = useCampaignInvitePcBuildContext(context.campaign.id, inviteId, session?.user.id)

  if (inviteUnavailableReason) {
    return (
      <WidePage spacing="relaxed" className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-4">
          <Heading variant="section" as="h2">
            Invitation unavailable
          </Heading>
          <Text variant="destructive" role="alert">
            {formatInviteUnavailableMessage(inviteUnavailableReason)}
          </Text>
          <Button type="button" variant="outline" onClick={onBack}>
            Back to onboarding choices
          </Button>
        </div>
      </WidePage>
    )
  }

  return (
    <WidePage spacing="relaxed" className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex flex-col gap-1">
        <Heading variant="section" as="h2">
          {context.campaign.name}
        </Heading>
        <Text variant="muted">Campaign starting level: {context.startingLevel}</Text>
      </div>

      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={error?.message}
        defaultErrorLabel="Could not load character builder."
      >
        {buildContext && catalogIndex ? (
          <CharacterBuilderShell
            context={buildContext}
            catalogIndex={catalogIndex}
            onExitClick={onBack}
            onInviteUnavailable={setInviteUnavailableReason}
          />
        ) : null}
      </PageLoadState>
    </WidePage>
  )
}
