import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  indexCharacterBuildCatalog,
  resolveCharacterBuilderDraftKey,
  resolveCharacterBuilderDraftScope,
  type CampaignBuildContext,
  type CharacterBuilderDraftScope,
  type CharacterOwnershipTarget,
  type ContentPlayActor,
  type SystemRulesetId,
} from '@rpg/contracts'
import type { CharacterBuildAcquisition } from '@rpg/contracts/rpg/character-builder'

import { useCampaigns } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'

import {
  campaignBuildContextQueryKey,
  fetchCampaignBuilderCatalog,
} from '../api/campaign-content-client'
import {
  resolveCampaignBuildContextUnavailable,
  type CampaignBuildContextUnavailable,
} from '../lib/campaign-context/resolve-campaign-build-context-unavailable.lib'
import { resolveCampaignBuildContext } from '../lib/campaign-context/resolve-campaign-build-context.lib'

type UseCampaignCharacterBuildContextInput = {
  campaignId: string | undefined
  characterKind: CampaignBuildContext['characterKind']
  ownershipTarget: CharacterOwnershipTarget | { type: 'user'; userId: string }
  acquisition: CharacterBuildAcquisition
  playActor?: ContentPlayActor
}

export type { CampaignBuildContextUnavailable }

export function useCampaignCharacterBuildContext({
  campaignId,
  characterKind,
  ownershipTarget,
  acquisition,
  playActor: playActorInput,
}: UseCampaignCharacterBuildContextInput) {
  const { data: campaigns } = useCampaigns()
  const rulesetId = campaigns?.find((campaign) => campaign.id === campaignId)?.rulesetId as
    | SystemRulesetId
    | undefined

  const playActor = useMemo((): ContentPlayActor | undefined => {
    if (playActorInput) {
      return playActorInput
    }
    if (characterKind === 'npc') {
      return { kind: 'npc' }
    }
    if (characterKind === 'pc') {
      return { kind: 'new_pc' }
    }
    return undefined
  }, [characterKind, playActorInput])

  const patchQuery = useRulesetPatch(campaignId)
  const catalogQuery = useQuery({
    queryKey:
      campaignId && rulesetId && playActor
        ? ([...campaignBuildContextQueryKey(campaignId, playActor), 'catalog', rulesetId] as const)
        : [],
    queryFn: () => fetchCampaignBuilderCatalog(campaignId!, rulesetId!, { playActor: playActor! }),
    enabled: Boolean(campaignId && rulesetId && playActor),
  })

  const context = useMemo((): CampaignBuildContext | null => {
    if (!campaignId || !rulesetId || !patchQuery.data || !catalogQuery.data || !playActor) {
      return null
    }

    return resolveCampaignBuildContext({
      campaignId,
      rulesetId,
      catalog: catalogQuery.data,
      patch: patchQuery.data,
      characterKind,
      ownershipTarget,
      acquisition,
      playActor,
    })
  }, [
    acquisition,
    campaignId,
    catalogQuery.data,
    characterKind,
    ownershipTarget,
    patchQuery.data,
    playActor,
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

  const unavailable = resolveCampaignBuildContextUnavailable({
    campaignId,
    rulesetId,
    isPending,
    hasPatch: Boolean(patchQuery.data),
    hasCatalog: Boolean(catalogQuery.data),
    characterKind,
    ownershipTarget,
    acquisition,
    context,
  })

  return {
    context,
    catalogIndex,
    draftScope,
    storageKey,
    rulesetId,
    unavailable,
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
    playActor: { kind: 'npc' },
  })
}

export function useCampaignPcOnboardingBuildContext(
  campaignId: string | undefined,
  userId: string | undefined,
  playActorCharacterId?: string,
) {
  const resolvedCampaignId = campaignId && userId ? campaignId : undefined
  const playActor =
    playActorCharacterId && playActorCharacterId.length > 0
      ? ({ kind: 'pc', characterId: playActorCharacterId } as const)
      : ({ kind: 'new_pc' } as const)

  return useCampaignCharacterBuildContext({
    campaignId: resolvedCampaignId,
    characterKind: 'pc',
    ownershipTarget: userId ? { type: 'user', userId } : { type: 'user' },
    acquisition:
      campaignId && userId
        ? { kind: 'campaign_pc_onboarding', campaignId }
        : { kind: 'campaign_pc_onboarding', campaignId: '' },
    playActor,
  })
}

/** @deprecated Prefer `useCampaignNpcBuildContext` for campaign NPC authoring. */
export function useCampaignBuildContext(campaignId: string | undefined) {
  return useCampaignNpcBuildContext(campaignId)
}

export type CampaignBuildContextResult = ReturnType<typeof useCampaignCharacterBuildContext>

export type { CampaignBuildContext, SystemRulesetId }
