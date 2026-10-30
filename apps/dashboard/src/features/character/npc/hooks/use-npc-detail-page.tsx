import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getCharacterTypeLabel } from '@rpg/contracts'
import { resolveCampaignXpProgressionForRules } from '@/lib/campaign-xp-progression.lib'

import { useCanManageCampaign } from '@/features/campaign'

import { useCampaignBuildFoundation } from '../../hooks/use-campaign-build-context'
import { useCharacterOrganizationReferences } from '../../hooks/use-character-organization-references'
import { useCharacterLocationReferences } from '../../hooks/use-character-location-references'
import { resolveCampaignDetailUnavailable } from '../../lib/campaign-context/resolve-campaign-detail-unavailable.lib'
import {
  buildCharacterDetailViewModel,
  toCharacterDetailSource,
} from '../../lib/display/character-display'
import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'
import { useNpcDeleteFlow } from './use-npc-delete-flow'
import { useNpc } from './use-npcs'

const REFERENCE_CATALOG_SCOPE = { scope: 'reference' } as const

function buildNpcDetailViewModel(input: {
  character: NonNullable<ReturnType<typeof useNpc>['data']>['character'] | undefined
  foundation: ReturnType<typeof useCampaignBuildFoundation>
  unavailable: ReturnType<typeof resolveCampaignDetailUnavailable>
  organizationReferences: ReturnType<typeof useCharacterOrganizationReferences>['data']
  locationReferences: ReturnType<typeof useCharacterLocationReferences>['data']
}) {
  const { character, foundation, unavailable } = input
  if (!character || !foundation.catalogIndex || !foundation.rules || !foundation.rulesetId) {
    return null
  }
  if (unavailable) return null

  return buildCharacterDetailViewModel({
    source: toCharacterDetailSource(character),
    catalogIndex: foundation.catalogIndex,
    rules: foundation.rules.characterCreationRules,
    xpProgression: resolveCampaignXpProgressionForRules(
      foundation.rulesetId,
      foundation.rules.characterCreationRules.progression,
    ),
    organizationReferences: input.organizationReferences,
    locationReferences: input.locationReferences,
  })
}

function npcDetailLoadState(input: {
  npcPending: boolean
  npcError: boolean
  npcData: unknown
  foundationPending: boolean
  foundationError: boolean
  organizationPending: boolean
  organizationError: boolean
  locationPending: boolean
  locationError: boolean
}) {
  return {
    isPending:
      input.npcPending ||
      input.organizationPending ||
      input.locationPending ||
      Boolean(input.npcData && input.foundationPending),
    isError:
      input.npcError || input.foundationError || input.organizationError || input.locationError,
  }
}

export function useNpcDetailPage() {
  const { campaignId = '', npcId } = useParams<{ campaignId: string; npcId: string }>()
  const canManage = useCanManageCampaign(campaignId)
  const npcQuery = useNpc(campaignId, npcId)
  const foundation = useCampaignBuildFoundation(campaignId || undefined, {
    catalogScope: REFERENCE_CATALOG_SCOPE,
  })
  const organizationReferencesQuery = useCharacterOrganizationReferences(campaignId, npcId)
  const locationReferencesQuery = useCharacterLocationReferences(campaignId, npcId)
  const character = npcQuery.data?.character

  const unavailable = resolveCampaignDetailUnavailable({
    foundationUnavailable: foundation.unavailable,
    campaignRulesetId: foundation.rulesetId,
    characterRulesetId: character?.rulesetId,
  })

  const viewModel = useMemo(
    () =>
      buildNpcDetailViewModel({
        character,
        foundation,
        unavailable,
        organizationReferences: organizationReferencesQuery.data,
        locationReferences: locationReferencesQuery.data,
      }),
    [
      character,
      foundation,
      locationReferencesQuery.data,
      organizationReferencesQuery.data,
      unavailable,
    ],
  )

  const deleteFlow = useNpcDeleteFlow({
    campaignId,
    npcId,
    entityName: viewModel?.identity.name ?? getCharacterTypeLabel('npc'),
  })

  const loadState = npcDetailLoadState({
    npcPending: npcQuery.isPending,
    npcError: npcQuery.isError,
    npcData: npcQuery.data,
    foundationPending: foundation.isPending,
    foundationError: foundation.isError,
    organizationPending: organizationReferencesQuery.isPending,
    organizationError: organizationReferencesQuery.isError,
    locationPending: locationReferencesQuery.isPending,
    locationError: locationReferencesQuery.isError,
  })
  const errorLabel = resolveQueryErrorLabel([
    npcQuery,
    { isPending: foundation.isPending, isError: foundation.isError, error: foundation.error },
    organizationReferencesQuery,
    locationReferencesQuery,
  ])

  const refetch = () =>
    Promise.all([
      foundation.refetch(),
      npcQuery.refetch(),
      organizationReferencesQuery.refetch(),
      locationReferencesQuery.refetch(),
    ])

  return {
    campaignId,
    canManage,
    deleteFlow,
    errorLabel,
    isError: loadState.isError,
    isPending: loadState.isPending,
    npcDetail: npcQuery.data,
    organizationReferences: organizationReferencesQuery.data,
    refetch,
    unavailable,
    viewModel,
  }
}
