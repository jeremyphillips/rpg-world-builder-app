import { useParams } from 'react-router-dom'

import { PageLoadState } from '@/components/layout/page-load-state'

import { CharacterBuilderShell } from '../../components/character-builder-shell.client'
import { characterBuilderRouteClasses } from '../../components/character-builder-shell.variants'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { NpcAuthoringGate } from '../components/npc-authoring-gate.client'

export function NpcCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { context, catalogIndex, isPending, isError, error } = useCampaignBuildContext(campaignId)

  return (
    <NpcAuthoringGate campaignId={campaignId}>
      <div className={characterBuilderRouteClasses}>
        <PageLoadState
          isPending={isPending}
          isError={isError}
          errorLabel={error?.message}
          defaultErrorLabel="Could not load NPC builder."
        >
          {context && catalogIndex ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />
            </div>
          ) : null}
        </PageLoadState>
      </div>
    </NpcAuthoringGate>
  )
}
