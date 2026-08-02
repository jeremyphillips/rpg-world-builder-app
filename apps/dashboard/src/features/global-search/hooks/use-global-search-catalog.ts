import { useQuery } from '@tanstack/react-query'

import { fetchGlobalSearchCatalog } from '../api/global-search-catalog'
import { GLOBAL_SEARCH_CATALOG_STALE_TIME_MS } from '../lib/global-search-constants'
import { globalSearchCatalogQueryKey } from '../lib/global-search-query-keys'

export function useGlobalSearchCatalog(
  campaignId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: globalSearchCatalogQueryKey(campaignId),
    queryFn: () => fetchGlobalSearchCatalog(campaignId!),
    enabled: Boolean(campaignId) && (options?.enabled ?? true),
    staleTime: GLOBAL_SEARCH_CATALOG_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  })
}
