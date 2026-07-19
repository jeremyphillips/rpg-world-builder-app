import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { type SystemRulesetId } from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'

import { CharacterDetailContent } from '../../components/detail/character-detail-content.client'
import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { buildCharacterDetailViewModel } from '../../lib/character-display'
import { NpcAuthoringGate } from '../components/npc-authoring-gate.client'
import { useNpc } from '../hooks/use-npcs'

export function NpcDetail() {
  const { campaignId = '', npcId } = useParams<{ campaignId: string; npcId: string }>()
  const {
    data: npc,
    isPending: isNpcPending,
    isError: isNpcError,
    error: npcError,
  } = useNpc(campaignId, npcId)
  const {
    catalogIndex,
    context,
    isPending: isContextPending,
    isError: isContextError,
    error: contextError,
  } = useCampaignBuildContext(campaignId)

  const viewModel = useMemo(() => {
    if (!npc || !catalogIndex || !context) return null

    return buildCharacterDetailViewModel({
      character: npc,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: getStandardXpProgression(npc.rulesetId as SystemRulesetId),
    })
  }, [catalogIndex, context, npc])

  const isPending = isNpcPending || Boolean(npc && isContextPending)
  const isError = isNpcError || isContextError
  const errorLabel = npcError?.message ?? contextError?.message

  return (
    <NpcAuthoringGate campaignId={campaignId}>
      <WidePage spacing="relaxed">
        <PageLoadState
          isPending={isPending}
          isError={isError}
          errorLabel={errorLabel}
          defaultErrorLabel="Could not load NPC."
        >
          {viewModel ? <CharacterDetailContent viewModel={viewModel} /> : null}
        </PageLoadState>
      </WidePage>
    </NpcAuthoringGate>
  )
}
