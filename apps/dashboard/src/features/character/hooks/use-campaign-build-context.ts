import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  indexCharacterBuildCatalog,
  resolveCharacterBuilderDraftKey,
  resolveCharacterBuilderDraftScope,
  type CampaignBuildContext,
  type CharacterBuildCatalog,
  type CharacterBuilderDraftScope,
  type CharacterBuildCatalogIndex,
  type CharacterOwnershipTarget,
  type ContentPlayActor,
  type RulesetPatchRead,
  type SystemRulesetId,
} from '@rpg/contracts'
import type { CharacterBuildAcquisition } from '@rpg/contracts/rpg/character-builder'

import { useCampaigns } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'

import {
  campaignBuildContextQueryKey,
  fetchCampaignBuilderCatalog,
  type FetchCampaignBuilderCatalogOptions,
} from '../api/campaign-content-client'
import {
  resolveCampaignBuildContext,
  resolveCampaignBuildRules,
} from '../lib/campaign-context/resolve-campaign-build-context.lib'
import {
  resolveCampaignBuildContextUnavailable,
  resolveCampaignBuildFoundationUnavailable,
  type CampaignBuildContextUnavailable,
  type CampaignBuildFoundationUnavailable,
} from '../lib/campaign-context/resolve-campaign-build-context-unavailable.lib'

type UseCampaignCharacterBuildContextInput = {
  campaignId: string | undefined
  characterKind: CampaignBuildContext['characterKind']
  ownershipTarget: CharacterOwnershipTarget | { type: 'user'; userId: string }
  acquisition: CharacterBuildAcquisition
  playActor?: ContentPlayActor
}

export type { CampaignBuildContextUnavailable, CampaignBuildFoundationUnavailable }

export type CampaignBuildFoundationResult = {
  rulesetId: SystemRulesetId | undefined
  patch: RulesetPatchRead | undefined
  catalog: CharacterBuildCatalog | undefined
  catalogIndex: CharacterBuildCatalogIndex | null
  rules: ReturnType<typeof resolveCampaignBuildRules> | null
  unavailable: CampaignBuildFoundationUnavailable | null
  /** Active fetches and an unresolved campaign list. Disabled queries are not pending. */
  isPending: boolean
  /** Raw query pending flags, including disabled queries. Builder pages keep this. */
  queryPending: boolean
  isError: boolean
  isFetching: boolean
  error: Error | null
  refetch: () => Promise<unknown>
}

function isQueryActivelyPending(query: { isPending: boolean; fetchStatus?: string }): boolean {
  return query.isPending && query.fetchStatus !== 'idle'
}

function campaignCatalogQueryKey(
  campaignId: string | undefined,
  rulesetId: SystemRulesetId | undefined,
  catalogScope: FetchCampaignBuilderCatalogOptions | undefined,
) {
  if (!campaignId || !rulesetId || !catalogScope) return [] as const
  return [...campaignBuildContextQueryKey(campaignId, catalogScope), 'catalog', rulesetId] as const
}

function isCampaignFoundationPending(input: {
  campaignId: string | undefined
  campaignsPending: boolean
  patchActivelyPending: boolean
  catalogEnabled: boolean
  catalogPending: boolean
}): boolean {
  if (!input.campaignId) return false
  if (input.campaignsPending || input.patchActivelyPending) return true
  return input.catalogEnabled && input.catalogPending
}

function indexLoadedCatalog(catalog: CharacterBuildCatalog | undefined) {
  return catalog ? indexCharacterBuildCatalog(catalog) : null
}

function rulesFromPatch(
  patch: RulesetPatchRead | undefined,
  rulesetId: SystemRulesetId | undefined,
) {
  if (!patch || !rulesetId) return null
  return resolveCampaignBuildRules(patch, rulesetId)
}

function foundationQueryState(input: {
  campaignId: string | undefined
  rulesetId: SystemRulesetId | undefined
  catalogEnabled: boolean
  patch: RulesetPatchRead | undefined
  catalog: CharacterBuildCatalog | undefined
  rules: ReturnType<typeof resolveCampaignBuildRules> | null
  campaignsPending: boolean
  patchQuery: {
    isPending: boolean
    isError: boolean
    isFetching: boolean
    fetchStatus?: string
    error: Error | null
  }
  catalogQuery: { isPending: boolean; isError: boolean; isFetching: boolean; error: Error | null }
}) {
  const isPending = isCampaignFoundationPending({
    campaignId: input.campaignId,
    campaignsPending: input.campaignsPending,
    patchActivelyPending: isQueryActivelyPending(input.patchQuery),
    catalogEnabled: input.catalogEnabled,
    catalogPending: input.catalogQuery.isPending,
  })
  const isError = input.patchQuery.isError || input.catalogQuery.isError
  const isReady = Boolean(
    input.campaignId && input.rulesetId && input.patch && input.catalog && input.rules,
  )

  return {
    isPending,
    isError,
    isReady,
    error: input.patchQuery.error ?? input.catalogQuery.error ?? null,
    isFetching: input.patchQuery.isFetching || input.catalogQuery.isFetching,
    queryPending: input.patchQuery.isPending || input.catalogQuery.isPending,
  }
}

/** Patch, reference-or-play catalog, and rules shared by builder and detail sheets. */
export function useCampaignBuildFoundation(
  campaignId: string | undefined,
  options: { catalogScope: FetchCampaignBuilderCatalogOptions | undefined },
): CampaignBuildFoundationResult {
  const campaignsQuery = useCampaigns()
  const rulesetId = campaignsQuery.data?.find((campaign) => campaign.id === campaignId)
    ?.rulesetId as SystemRulesetId | undefined
  const catalogScope = options.catalogScope
  const catalogEnabled = Boolean(campaignId && rulesetId && catalogScope)

  const patchQuery = useRulesetPatch(campaignId)
  const catalogQuery = useQuery({
    queryKey: campaignCatalogQueryKey(campaignId, rulesetId, catalogScope),
    queryFn: () => fetchCampaignBuilderCatalog(campaignId!, rulesetId!, catalogScope!),
    enabled: catalogEnabled,
  })

  const catalogIndex = useMemo(() => indexLoadedCatalog(catalogQuery.data), [catalogQuery.data])

  const rules = useMemo(
    () => rulesFromPatch(patchQuery.data, rulesetId),
    [patchQuery.data, rulesetId],
  )

  const queryState = foundationQueryState({
    campaignId,
    rulesetId,
    catalogEnabled,
    patch: patchQuery.data,
    catalog: catalogQuery.data,
    rules,
    campaignsPending: Boolean(campaignsQuery.isPending),
    patchQuery,
    catalogQuery,
  })

  const unavailable = resolveCampaignBuildFoundationUnavailable({
    campaignId,
    rulesetId,
    isPending: queryState.isPending,
    hasPatch: Boolean(patchQuery.data),
    hasCatalog: Boolean(catalogQuery.data),
    isReady: queryState.isReady,
    isError: queryState.isError,
  })

  const refetch = () =>
    Promise.all([
      patchQuery.refetch(),
      catalogEnabled ? catalogQuery.refetch() : Promise.resolve(undefined),
    ])

  return {
    rulesetId,
    patch: patchQuery.data,
    catalog: catalogQuery.data,
    catalogIndex,
    rules,
    unavailable,
    isPending: queryState.isPending,
    queryPending: queryState.queryPending,
    isError: queryState.isError,
    isFetching: queryState.isFetching,
    error: queryState.error,
    refetch,
  }
}

export function useCampaignCharacterBuildContext({
  campaignId,
  characterKind,
  ownershipTarget,
  acquisition,
  playActor: playActorInput,
}: UseCampaignCharacterBuildContextInput) {
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

  const foundation = useCampaignBuildFoundation(campaignId, {
    catalogScope: playActor ? { scope: 'play', playActor } : undefined,
  })
  const { rulesetId, patch, catalog } = foundation

  const context = useMemo((): CampaignBuildContext | null => {
    if (!campaignId || !rulesetId || !patch || !catalog || !playActor) {
      return null
    }

    return resolveCampaignBuildContext({
      campaignId,
      rulesetId,
      catalog,
      patch,
      characterKind,
      ownershipTarget,
      acquisition,
      playActor,
    })
  }, [
    acquisition,
    campaignId,
    catalog,
    characterKind,
    ownershipTarget,
    patch,
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

  const unavailable = resolveCampaignBuildContextUnavailable({
    campaignId,
    rulesetId,
    isPending: foundation.queryPending,
    hasPatch: Boolean(patch),
    hasCatalog: Boolean(catalog),
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
    isPending: foundation.queryPending,
    isError: foundation.isError,
    isFetching: foundation.isFetching,
    error: foundation.error,
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
