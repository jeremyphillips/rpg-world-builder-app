import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'

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
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
}

export type ContentListUsageMeta = {
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
}

type ContentListResponseBody<T> = Record<
  string,
  T[] | ContentUsageSummaryLabels | ContentOverviewUsageScope | undefined
>

export function createContentListApi<T>(config: ContentListConfig) {
  const { routeKey, responseKey, errorMessage } = config

  return async function listContent(campaignId: string): Promise<ContentListResult<T>> {
    const body = await request<ContentListResponseBody<T>>(
      `/api/campaigns/${campaignId}/content/${routeKey}`,
      undefined,
      errorMessage,
    )
    return {
      items: (body[responseKey] as T[]) ?? [],
      ...(body.usageSummaryLabels
        ? { usageSummaryLabels: body.usageSummaryLabels as ContentUsageSummaryLabels }
        : {}),
      ...(body.overviewUsageScope
        ? { overviewUsageScope: body.overviewUsageScope as ContentOverviewUsageScope }
        : {}),
    }
  }
}

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

  return { queryKey, useQuery: useQueryHook, useUsageMeta }
}
