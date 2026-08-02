import type { GlobalSearchCatalogResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

export async function fetchGlobalSearchCatalog(
  campaignId: string,
): Promise<GlobalSearchCatalogResponse> {
  return request<GlobalSearchCatalogResponse>(
    `/api/campaigns/${campaignId}/search/catalog`,
    undefined,
    'Could not load search catalog.',
  )
}
