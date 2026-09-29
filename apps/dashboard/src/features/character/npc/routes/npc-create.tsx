import { useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { CharacterBuilderDraft } from '@rpg/contracts'

import { PageLoadState } from '@/components/layout/page/page-load-state'

import { CharacterBuilderPageShell } from '../../components/builder/character-builder-page-shell'
import { CharacterBuilderShell } from '../../components/builder/character-builder-shell'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { NpcAuthoringGate } from '../components/npc-authoring-gate'

export type NpcCreateLocationState = {
  builderSeed?: CharacterBuilderDraft
}

export function NpcCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as NpcCreateLocationState | null
  const builderSeed = locationState?.builderSeed
  const { context, catalogIndex, isPending, isError, error } = useCampaignBuildContext(campaignId)

  const handleBuilderSeedApplied = useCallback(() => {
    if (!locationState?.builderSeed) return
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, locationState?.builderSeed, navigate])

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
            <CharacterBuilderShell
              context={context}
              catalogIndex={catalogIndex}
              builderSeed={builderSeed}
              onBuilderSeedApplied={handleBuilderSeedApplied}
            />
          ) : null}
        </PageLoadState>
      </CharacterBuilderPageShell>
    </NpcAuthoringGate>
  )
}
