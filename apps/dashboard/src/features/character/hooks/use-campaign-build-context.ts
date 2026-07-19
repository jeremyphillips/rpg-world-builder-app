import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  getCharacterBuilderStorageKey,
  indexCharacterBuildCatalog,
  type CampaignBuildContext,
  type SystemRulesetId,
} from '@rpg/contracts'

import { useCampaigns } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'

import {
  campaignBuildContextQueryKey,
  fetchCampaignBuilderCatalog,
} from '../api/campaign-content-client'

export function useCampaignBuildContext(campaignId: string | undefined) {
  const { data: campaigns } = useCampaigns()
  const rulesetId = campaigns?.find((campaign) => campaign.id === campaignId)?.rulesetId as
    | SystemRulesetId
    | undefined

  const patchQuery = useRulesetPatch(campaignId)
  const catalogQuery = useQuery({
    queryKey:
      campaignId && rulesetId
        ? ([...campaignBuildContextQueryKey(campaignId), 'catalog', rulesetId] as const)
        : [],
    queryFn: () => fetchCampaignBuilderCatalog(campaignId!, rulesetId!),
    enabled: Boolean(campaignId && rulesetId),
  })

  const context = useMemo((): CampaignBuildContext | null => {
    if (!campaignId || !rulesetId || !patchQuery.data || !catalogQuery.data) return null

    const rulesScope = { type: 'campaign' as const, campaignId, rulesetId }

    return {
      channel: 'build',
      surface: 'dashboard',
      characterKind: 'npc',
      mode: 'dashboard',
      scope: { type: 'campaign', campaignId, rulesetId },
      rulesScope,
      ownershipTarget: { type: 'campaign', campaignId },
      rulesetId,
      catalog: catalogQuery.data,
      characterCreationRules: {
        ...patchQuery.data.characterCreation,
        abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
        armorClass: patchQuery.data.mechanics.armorClass,
      },
      permissions: { canCreateCharacter: true },
    }
  }, [campaignId, catalogQuery.data, patchQuery.data, rulesetId])

  const catalogIndex = useMemo(
    () => (context ? indexCharacterBuildCatalog(context.catalog) : null),
    [context],
  )

  const storageKey = useMemo(
    () => (context ? getCharacterBuilderStorageKey(context) : null),
    [context],
  )

  const isPending = patchQuery.isPending || catalogQuery.isPending
  const isError = patchQuery.isError || catalogQuery.isError
  const error = patchQuery.error ?? catalogQuery.error

  return {
    context,
    catalogIndex,
    storageKey,
    rulesetId,
    isPending,
    isError,
    isFetching: patchQuery.isFetching || catalogQuery.isFetching,
    error,
  }
}

export type CampaignBuildContextResult = ReturnType<typeof useCampaignBuildContext>

export type { CampaignBuildContext, SystemRulesetId }
