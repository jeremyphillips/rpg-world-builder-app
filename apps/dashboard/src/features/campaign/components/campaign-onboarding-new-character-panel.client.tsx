'use client'

import type { CampaignOnboardingIncompleteContext } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { useSession } from '@/features/auth'
import { CharacterBuilderShell } from '@/features/character/components/character-builder-shell.client'
import { useCampaignPcOnboardingBuildContext } from '@/features/character/hooks/use-campaign-build-context'

export function CampaignOnboardingNewCharacterPanel({
  context,
  campaignId,
  onBack,
}: {
  context: CampaignOnboardingIncompleteContext
  campaignId: string
  onBack: () => void
}) {
  const { data: session } = useSession()
  const {
    context: buildContext,
    catalogIndex,
    isPending,
    isError,
    error,
  } = useCampaignPcOnboardingBuildContext(campaignId, session?.user.id)

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
          />
        ) : null}
      </PageLoadState>
    </WidePage>
  )
}
