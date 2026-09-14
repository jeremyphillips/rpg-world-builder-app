import { useParams } from 'react-router-dom'

import { PageLoadState } from '@/components/layout/page/page-load-state'

import { CharacterBuilderPageShell } from '../../components/builder/character-builder-page-shell'
import { CharacterBuilderShell } from '../../components/builder/character-builder-shell'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { NpcAuthoringGate } from '../components/npc-authoring-gate'

export function NpcCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { context, catalogIndex, isPending, isError, error } = useCampaignBuildContext(campaignId)

  return (
    <NpcAuthoringGate campaignId={campaignId}>
      <CharacterBuilderPageShell className="h-dvh">
        <PageLoadState
          isPending={isPending}
          isError={isError}
          errorLabel={error?.message}
          defaultErrorLabel="Could not load NPC builder."
        >
          {context && catalogIndex ? (
            <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />
          ) : null}
        </PageLoadState>
      </CharacterBuilderPageShell>
    </NpcAuthoringGate>
  )
}
