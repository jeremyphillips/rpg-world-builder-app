import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { request } from '@/lib/api-client'

export type ContentListConfig = {
  /** Kebab-case path segment — must match API route + query key */
  routeKey: string
  /** camelCase key in JSON response body — must match controller */
  responseKey: string
  errorMessage: string
}

export function createContentListApi<T>(config: ContentListConfig) {
  const { routeKey, responseKey, errorMessage } = config

  return async function listContent(campaignId: string): Promise<T[]> {
    const body = await request<Record<string, T[]>>(
      `/api/campaigns/${campaignId}/content/${routeKey}`,
      undefined,
      errorMessage,
    )
    return body[responseKey] as T[]
  }
}

export function createContentQueryHook<T>(
  config: ContentListConfig,
  listFn: (campaignId: string) => Promise<T[]>,
) {
  const { routeKey } = config

  function queryKey(campaignId: string) {
    return ['campaigns', campaignId, 'content', routeKey] as const
  }

  function useQueryHook(campaignId: string | undefined): UseQueryResult<T[]> {
    return useQuery({
      queryKey: campaignId ? queryKey(campaignId) : [],
      queryFn: () => listFn(campaignId!),
      enabled: Boolean(campaignId),
    })
  }

  return { queryKey, useQuery: useQueryHook }
}
