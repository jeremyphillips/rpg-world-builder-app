import { useMemo } from 'react'
import { type SystemRulesetId } from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { useBuildContext } from '@/features/character'
import { useCharacterOrganizationReferences } from '@/features/character'
import { useCharacterLocationReferences } from '@/features/character'
import { buildCharacterDetailViewModel, type CharacterDetailViewModel } from '@/features/character'
import {
  combineQueryError,
  combineQueryPending,
  resolveQueryErrorLabel,
} from '@/lib/query/query-state.lib'

import { useCampaignCharacter } from './use-campaign-character'

type CampaignCharacterDetailState = {
  campaignCharacter: NonNullable<ReturnType<typeof useCampaignCharacter>['data']> | undefined
  viewModel: CharacterDetailViewModel | null
  organizationReferences: ReturnType<typeof useCharacterOrganizationReferences>['data']
  locationReferences: ReturnType<typeof useCharacterLocationReferences>['data']
  isPending: boolean
  isError: boolean
  errorLabel: string | undefined
}

export function useCampaignCharacterDetail(
  campaignId: string | undefined,
  characterId: string | undefined,
): CampaignCharacterDetailState {
  const campaignCharacterQuery = useCampaignCharacter(campaignId, characterId)
  const character = campaignCharacterQuery.data?.character
  const buildContextQuery = useBuildContext(character?.rulesetId as SystemRulesetId | undefined)
  const organizationReferencesQuery = useCharacterOrganizationReferences(campaignId, characterId)
  const locationReferencesQuery = useCharacterLocationReferences(campaignId, characterId)

  const viewModel = useMemo(() => {
    const { catalogIndex, context } = buildContextQuery
    if (!character || !catalogIndex || !context) return null

    return buildCharacterDetailViewModel({
      character,
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: getStandardXpProgression(character.rulesetId as SystemRulesetId),
      organizationReferences: organizationReferencesQuery.data,
      locationReferences: locationReferencesQuery.data,
    })
  }, [buildContextQuery, character, organizationReferencesQuery.data, locationReferencesQuery.data])

  const querySlices = [
    campaignCharacterQuery,
    buildContextQuery,
    organizationReferencesQuery,
    locationReferencesQuery,
  ] as const

  return {
    campaignCharacter: campaignCharacterQuery.data,
    viewModel,
    organizationReferences: organizationReferencesQuery.data,
    locationReferences: locationReferencesQuery.data,
    isPending:
      combineQueryPending(querySlices) || Boolean(character && buildContextQuery.isPending),
    isError: combineQueryError(querySlices),
    errorLabel: resolveQueryErrorLabel(querySlices),
  }
}
