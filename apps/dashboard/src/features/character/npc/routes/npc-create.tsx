import { useParams } from 'react-router-dom'

import { PageLoadState } from '@/components/layout/page/page-load-state'
import { WidePage } from '@/components/layout/page/wide-page'

import { CharacterBuilderShell } from '../../components/builder/character-builder-shell'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { NpcAuthoringGate } from '../components/npc-authoring-gate'

export function NpcCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { context, catalogIndex, isPending, isError, error } = useCampaignBuildContext(campaignId)

  return (
    <NpcAuthoringGate campaignId={campaignId}>
      <WidePage spacing="relaxed" className="flex min-h-0 flex-1 flex-col">
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
      </WidePage>
    </NpcAuthoringGate>
  )
}
