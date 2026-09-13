import { useParams } from 'react-router-dom'

import { PageLoadState } from '@/components/layout/page/page-load-state'
import { viewportFillClasses } from '@/components/layout/page/page-scroll.variants'
import { ViewportShell } from '@/components/layout/page/viewport-shell'
import { WidePage } from '@/components/layout/page/wide-page'

import { CharacterBuilderShell } from '../../components/builder/character-builder-shell'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { NpcAuthoringGate } from '../components/npc-authoring-gate'

export function NpcCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { context, catalogIndex, isPending, isError, error } = useCampaignBuildContext(campaignId)

  return (
    <NpcAuthoringGate campaignId={campaignId}>
      <ViewportShell>
        <div className={viewportFillClasses}>
          <WidePage spacing="none" rhythm="relaxed" className={viewportFillClasses}>
            <div className={viewportFillClasses}>
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
            </div>
          </WidePage>
        </div>
      </ViewportShell>
    </NpcAuthoringGate>
  )
}
