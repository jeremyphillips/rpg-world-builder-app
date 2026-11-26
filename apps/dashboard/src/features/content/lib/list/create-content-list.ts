import { useMemo } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type {
  CatalogOverlayListFailure,
  ContentOverviewUsageScope,
  ContentStatus,
  ContentUsageSummaryLabels,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { request } from '@/lib/api-client'

export type ContentListConfig = {
  /** Kebab-case path segment — must match API route + query key */
  routeKey: string
  /** camelCase key in JSON response body — must match controller */
  responseKey: string
  errorMessage: string
}

export type ContentListResult<T> = {
  items: T[]
  overlayFailures?: CatalogOverlayListFailure[]
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
}

/** Synthetic overview row for system records whose overlay could not be applied. */
export type ContentOverlayFailureOverviewRow = {
  id: string
  name: string
  slug: string
  status: ContentStatus
  catalogLayer: 'system'
  campaignAccess: ResolvedContentCampaignAccess
  overlayListFailure: CatalogOverlayListFailure
  contentOverlayResolveFailure: true
}

export function overlayFailureOverviewRows(
  failures: readonly CatalogOverlayListFailure[] | undefined,
): ContentOverlayFailureOverviewRow[] {
  if (!failures?.length) return []
  // Structural `WithCampaignAccess` only — `isContentOverlayFailureOverviewRow` owns unresolved UX.
  return failures.map((failure) => ({
    id: failure.targetId,
    name: failure.name,
    slug: failure.slug,
    status: 'published' as const,
    catalogLayer: 'system' as const,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    overlayListFailure: failure,
    contentOverlayResolveFailure: true as const,
  }))
}

export function mergeContentListOverviewRows<T extends { id: string }>(
  items: readonly T[],
  failures: readonly CatalogOverlayListFailure[] | undefined,
): Array<T | ContentOverlayFailureOverviewRow> {
  return [...items, ...overlayFailureOverviewRows(failures)]
}

export function findContentOverlayListFailure(
  failures: readonly CatalogOverlayListFailure[] | undefined,
  entityId: string,
): CatalogOverlayListFailure | undefined {
  return failures?.find((failure) => failure.targetId === entityId)
}

export type ContentListUsageMeta = {
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
}

type ContentListResponseBody<T> = Record<
  string,
  | T[]
  | CatalogOverlayListFailure[]
  | ContentUsageSummaryLabels
  | ContentOverviewUsageScope
  | undefined
>

export function createContentListApi<T>(config: ContentListConfig) {
  const { routeKey, responseKey, errorMessage } = config

  return async function listContent(campaignId: string): Promise<ContentListResult<T>> {
    const body = await request<ContentListResponseBody<T>>(
      `/api/campaigns/${campaignId}/content/${routeKey}`,
      undefined,
      errorMessage,
    )
    const overlayFailures = body.overlayFailures as CatalogOverlayListFailure[] | undefined
    return {
      items: (body[responseKey] as T[]) ?? [],
      ...(overlayFailures?.length ? { overlayFailures } : {}),
      ...(body.usageSummaryLabels
        ? { usageSummaryLabels: body.usageSummaryLabels as ContentUsageSummaryLabels }
        : {}),
      ...(body.overviewUsageScope
        ? { overviewUsageScope: body.overviewUsageScope as ContentOverviewUsageScope }
        : {}),
    }
  }
}

export type ContentListFullQueryResult<T> = Pick<
  UseQueryResult<ContentListResult<T>>,
  'data' | 'isPending' | 'isError'
>

export function createContentQueryHook<T>(
  config: ContentListConfig,
  listFn: (campaignId: string) => Promise<ContentListResult<T>>,
) {
  const { routeKey } = config

  function queryKey(campaignId: string) {
    return ['campaigns', campaignId, 'content', routeKey] as const
  }

  /** List rows — selects `items` from the shared list cache. */
  function useQueryHook(campaignId: string | undefined): UseQueryResult<T[]> {
    return useQuery({
      queryKey: campaignId ? queryKey(campaignId) : [],
      queryFn: () => listFn(campaignId!),
      select: (result) => result.items,
      enabled: Boolean(campaignId),
    })
  }

  /** Overview Used By metadata — same cache as {@link useQueryHook}. */
  function useUsageMeta(campaignId: string | undefined): UseQueryResult<ContentListUsageMeta> {
    return useQuery({
      queryKey: campaignId ? queryKey(campaignId) : [],
      queryFn: () => listFn(campaignId!),
      select: (result) => ({
        usageSummaryLabels: result.usageSummaryLabels,
        overviewUsageScope: result.overviewUsageScope,
      }),
      enabled: Boolean(campaignId),
    })
  }

  /** Full list payload — edit shell and overview failure rows. */
  function useListQueryResult(campaignId: string | undefined): ContentListFullQueryResult<T> {
    return useQuery({
      queryKey: campaignId ? queryKey(campaignId) : [],
      queryFn: () => listFn(campaignId!),
      enabled: Boolean(campaignId),
    })
  }

  return { queryKey, useQuery: useQueryHook, useUsageMeta, useListQueryResult }
}

/** Merges healthy list items with synthetic overlay-failure overview rows. */
export function useContentOverviewMergedData<T extends { id: string }>(
  listResult: ContentListFullQueryResult<T>,
) {
  const data = useMemo(
    () =>
      mergeContentListOverviewRows(listResult.data?.items ?? [], listResult.data?.overlayFailures),
    [listResult.data],
  )
  return {
    data,
    isPending: listResult.isPending,
    isError: listResult.isError,
  }
}
