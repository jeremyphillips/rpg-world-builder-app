import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  indexCharacterBuildCatalog,
  resolveCharacterBuilderDraftKey,
  resolveCharacterBuilderDraftScope,
  type CampaignBuildContext,
  type CampaignNpcBuildContext,
  type CampaignPcBuildContext,
  type CharacterBuildAcquisition,
  type CharacterBuilderDraftScope,
  type CharacterOwnershipTarget,
  type SystemRulesetId,
} from '@rpg/contracts'

import { useCampaigns } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'

import {
  campaignBuildContextQueryKey,
  fetchCampaignBuilderCatalog,
} from '../api/campaign-content-client'

type UseCampaignCharacterBuildContextInput = {
  campaignId: string | undefined
  characterKind: CampaignBuildContext['characterKind']
  ownershipTarget: CharacterOwnershipTarget | { type: 'user'; userId: string }
  acquisition: CharacterBuildAcquisition
}

export function useCampaignCharacterBuildContext({
  campaignId,
  characterKind,
  ownershipTarget,
  acquisition,
}: UseCampaignCharacterBuildContextInput) {
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
    const shared = {
      channel: 'build' as const,
      surface: 'dashboard' as const,
      mode: 'dashboard' as const,
      scope: { type: 'campaign' as const, campaignId, rulesetId },
      rulesScope,
      rulesetId,
      catalog: catalogQuery.data,
      characterCreationRules: {
        ...patchQuery.data.characterCreation,
        abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
        armorClass: patchQuery.data.mechanics.armorClass,
      },
      permissions: { canCreateCharacter: true },
    }

    if (characterKind === 'npc' && acquisition.kind === 'campaign_npc') {
      const npcContext: CampaignNpcBuildContext = {
        ...shared,
        characterKind: 'npc',
        ownershipTarget: { type: 'campaign', campaignId },
        acquisition,
      }
      return npcContext
    }

    if (
      characterKind === 'pc' &&
      acquisition.kind === 'campaign_pc_onboarding' &&
      ownershipTarget.type === 'user' &&
      'userId' in ownershipTarget
    ) {
      const pcContext: CampaignPcBuildContext = {
        ...shared,
        characterKind: 'pc',
        ownershipTarget,
        acquisition,
      }
      return pcContext
    }

    return null
  }, [
    acquisition,
    campaignId,
    catalogQuery.data,
    characterKind,
    ownershipTarget,
    patchQuery.data,
    rulesetId,
  ])

  const catalogIndex = useMemo(
    () => (context ? indexCharacterBuildCatalog(context.catalog) : null),
    [context],
  )

  const draftScope = useMemo((): CharacterBuilderDraftScope | null => {
    if (!context) return null
    return resolveCharacterBuilderDraftScope(context, undefined)
  }, [context])

  const storageKey = useMemo(
    () => (draftScope ? resolveCharacterBuilderDraftKey(draftScope, { mode: 'dashboard' }) : null),
    [draftScope],
  )

  const isPending = patchQuery.isPending || catalogQuery.isPending
  const isError = patchQuery.isError || catalogQuery.isError
  const error = patchQuery.error ?? catalogQuery.error

  return {
    context,
    catalogIndex,
    draftScope,
    storageKey,
    rulesetId,
    isPending,
    isError,
    isFetching: patchQuery.isFetching || catalogQuery.isFetching,
    error,
  }
}

export function useCampaignNpcBuildContext(campaignId: string | undefined) {
  return useCampaignCharacterBuildContext({
    campaignId,
    characterKind: 'npc',
    ownershipTarget: campaignId
      ? { type: 'campaign', campaignId }
      : { type: 'campaign', campaignId: '' },
    acquisition: campaignId
      ? { kind: 'campaign_npc', campaignId }
      : { kind: 'campaign_npc', campaignId: '' },
  })
}

export function useCampaignPcOnboardingBuildContext(
  campaignId: string | undefined,
  userId: string | undefined,
) {
  const resolvedCampaignId = campaignId && userId ? campaignId : undefined

  return useCampaignCharacterBuildContext({
    campaignId: resolvedCampaignId,
    characterKind: 'pc',
    ownershipTarget: userId ? { type: 'user', userId } : { type: 'user' },
    acquisition:
      campaignId && userId
        ? { kind: 'campaign_pc_onboarding', campaignId }
        : { kind: 'campaign_pc_onboarding', campaignId: '' },
  })
}

/** @deprecated Prefer `useCampaignNpcBuildContext` for campaign NPC authoring. */
export function useCampaignBuildContext(campaignId: string | undefined) {
  return useCampaignNpcBuildContext(campaignId)
}

export type CampaignBuildContextResult = ReturnType<typeof useCampaignCharacterBuildContext>

export type { CampaignBuildContext, SystemRulesetId }
