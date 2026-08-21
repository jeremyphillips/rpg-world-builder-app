import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { type SystemRulesetId } from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { useCanManageCampaign } from '@/features/campaign'

import { useCampaignBuildContext } from '../../hooks/use-campaign-build-context'
import { useCharacterOrganizationReferences } from '../../hooks/use-character-organization-references'
import { useCharacterLocationReferences } from '../../hooks/use-character-location-references'
import { buildCharacterDetailViewModel } from '../../lib/display/character-display'
import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'
import { useNpcDeleteFlow } from './use-npc-delete-flow'
import { useNpc } from './use-npcs'

export function useNpcDetailPage() {
  const { campaignId = '', npcId } = useParams<{ campaignId: string; npcId: string }>()
  const canManage = useCanManageCampaign(campaignId)
  const npcQuery = useNpc(campaignId, npcId)
  const buildContextQuery = useCampaignBuildContext(campaignId)
  const organizationReferencesQuery = useCharacterOrganizationReferences(campaignId, npcId)
  const locationReferencesQuery = useCharacterLocationReferences(campaignId, npcId)

  const viewModel = useMemo(() => {
    if (!npcQuery.data || !buildContextQuery.catalogIndex || !buildContextQuery.context) {
      return null
    }

    return buildCharacterDetailViewModel({
      character: npcQuery.data.character,
      catalogIndex: buildContextQuery.catalogIndex,
      rules: buildContextQuery.context.characterCreationRules,
      xpProgression: getStandardXpProgression(npcQuery.data.character.rulesetId as SystemRulesetId),
      organizationReferences: organizationReferencesQuery.data,
      locationReferences: locationReferencesQuery.data,
    })
  }, [
    buildContextQuery.catalogIndex,
    buildContextQuery.context,
    npcQuery.data,
    organizationReferencesQuery.data,
    locationReferencesQuery.data,
  ])

  const deleteFlow = useNpcDeleteFlow({
    campaignId,
    npcId,
    entityName: viewModel?.identity.name ?? 'NPC',
  })

  const isPending =
    npcQuery.isPending ||
    organizationReferencesQuery.isPending ||
    Boolean(npcQuery.data && buildContextQuery.isPending)
  const isError =
    npcQuery.isError || buildContextQuery.isError || organizationReferencesQuery.isError
  const errorLabel = resolveQueryErrorLabel([
    npcQuery,
    buildContextQuery,
    organizationReferencesQuery,
  ])

  return {
    campaignId,
    canManage,
    deleteFlow,
    errorLabel,
    isError,
    isPending,
    npcDetail: npcQuery.data,
    organizationReferences: organizationReferencesQuery.data,
    viewModel,
  }
}
