import { useMemo } from 'react'
import { resolveCampaignXpProgressionForRules } from '@/lib/campaign-xp-progression.lib'

import {
  resolveCampaignDetailUnavailable,
  useCampaignBuildFoundation,
  useCharacterOrganizationReferences,
  useCharacterLocationReferences,
  buildCharacterDetailViewModel,
  toCharacterDetailSource,
  type CampaignDetailUnavailable,
  type CharacterDetailViewModel,
} from '@/features/character'
import {
  combineQueryError,
  combineQueryPending,
  resolveQueryErrorLabel,
} from '@/lib/query/query-state.lib'

import { useCampaignCharacter } from './use-campaign-character'

const REFERENCE_CATALOG_SCOPE = { scope: 'reference' } as const

type CampaignCharacterDetailState = {
  campaignCharacter: NonNullable<ReturnType<typeof useCampaignCharacter>['data']> | undefined
  viewModel: CharacterDetailViewModel | null
  organizationReferences: ReturnType<typeof useCharacterOrganizationReferences>['data']
  locationReferences: ReturnType<typeof useCharacterLocationReferences>['data']
  unavailable: CampaignDetailUnavailable | null
  isPending: boolean
  isError: boolean
  errorLabel: string | undefined
  refetch: () => Promise<unknown>
}

export function useCampaignCharacterDetail(
  campaignId: string | undefined,
  characterId: string | undefined,
): CampaignCharacterDetailState {
  const campaignCharacterQuery = useCampaignCharacter(campaignId, characterId)
  const character = campaignCharacterQuery.data?.character
  const foundation = useCampaignBuildFoundation(campaignId, {
    catalogScope: REFERENCE_CATALOG_SCOPE,
  })
  const organizationReferencesQuery = useCharacterOrganizationReferences(campaignId, characterId)
  const locationReferencesQuery = useCharacterLocationReferences(campaignId, characterId)

  const unavailable = resolveCampaignDetailUnavailable({
    foundationUnavailable: foundation.unavailable,
    campaignRulesetId: foundation.rulesetId,
    characterRulesetId: character?.rulesetId,
  })

  const viewModel = useMemo(() => {
    const { catalogIndex, rules, rulesetId } = foundation
    if (!character || !catalogIndex || !rules || !rulesetId || unavailable) return null

    return buildCharacterDetailViewModel({
      source: toCharacterDetailSource(character),
      catalogIndex,
      rules: rules.characterCreationRules,
      xpProgression: resolveCampaignXpProgressionForRules(
        rulesetId,
        rules.characterCreationRules.progression,
      ),
      organizationReferences: organizationReferencesQuery.data,
      locationReferences: locationReferencesQuery.data,
    })
  }, [
    character,
    foundation,
    locationReferencesQuery.data,
    organizationReferencesQuery.data,
    unavailable,
  ])

  const querySlices = [
    campaignCharacterQuery,
    { isPending: foundation.isPending, isError: foundation.isError, error: foundation.error },
    organizationReferencesQuery,
    locationReferencesQuery,
  ] as const

  const refetch = () =>
    Promise.all([
      foundation.refetch(),
      campaignCharacterQuery.refetch(),
      organizationReferencesQuery.refetch(),
      locationReferencesQuery.refetch(),
    ])

  return {
    campaignCharacter: campaignCharacterQuery.data,
    viewModel,
    organizationReferences: organizationReferencesQuery.data,
    locationReferences: locationReferencesQuery.data,
    unavailable,
    isPending: combineQueryPending(querySlices) || Boolean(character && foundation.isPending),
    isError: combineQueryError(querySlices),
    errorLabel: resolveQueryErrorLabel(querySlices),
    refetch,
  }
}
