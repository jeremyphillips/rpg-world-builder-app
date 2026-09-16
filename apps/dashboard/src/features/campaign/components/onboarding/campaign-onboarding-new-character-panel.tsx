import type { CampaignOnboardingIncompleteContext } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { PageLoadState } from '@/components/layout/page/page-load-state'
import { useSession } from '@/features/auth'
import {
  CharacterBuilderPageShell,
  CharacterBuilderShell,
  useCampaignPcOnboardingBuildContext,
} from '@/features/character'

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
    <>
      <div className="mb-4 flex shrink-0 flex-col gap-1">
        <Heading variant="section" as="h2">
          {context.campaign.name}
        </Heading>
        <Text variant="muted">Campaign starting level: {context.startingLevel}</Text>
      </div>

      <CharacterBuilderPageShell className="h-dvh">
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
      </CharacterBuilderPageShell>
    </>
  )
}
