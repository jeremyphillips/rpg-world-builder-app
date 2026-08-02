import type { GlobalSearchCatalogResponse } from '@rpg/contracts'

import { SEARCH_SOURCES } from './search-registry'
import type { SearchCollectContext } from './lib/search-collect-context'

export async function collectGlobalSearchCatalog(
  ctx: SearchCollectContext,
): Promise<GlobalSearchCatalogResponse> {
  const documentGroups = await Promise.all(SEARCH_SOURCES.map((source) => source.collect(ctx)))

  return {
    documents: documentGroups.flat(),
    scope: {
      kind: 'campaign',
      campaignId: ctx.campaignId,
    },
  }
}
