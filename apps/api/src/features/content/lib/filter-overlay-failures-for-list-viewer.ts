import type { CatalogOverlayListFailure, ContentAccessTargetType } from '@rpg/contracts'

import { attachCampaignAccessForTargetType } from './content-campaign-access.service'
import type { CatalogListFilter } from './apply-catalog-list-filter'
import { filterCatalogForMembership, filterCatalogForReference } from './filter-catalog-for-viewer'

type OverlayFailureViewerRow = {
  id: string
  status: 'published'
  failure: CatalogOverlayListFailure
}

/**
 * Applies the same discovery / reference visibility contract as {@link applyCatalogListFilter}
 * to list `overlayFailures`. Managers retain discoverability for unavailable rows; players
 * do not receive failure metadata for content they cannot discover. Play-scoped lists omit
 * failures entirely (not playable entities).
 */
export async function filterOverlayFailuresForListViewer(
  campaignId: string,
  targetType: ContentAccessTargetType,
  failures: readonly CatalogOverlayListFailure[],
  filter: CatalogListFilter | undefined,
): Promise<CatalogOverlayListFailure[]> {
  if (failures.length === 0) {
    return []
  }

  if (filter?.mode === 'play') {
    return []
  }

  const seedRows: OverlayFailureViewerRow[] = failures.map((failure) => ({
    id: failure.targetId,
    status: 'published',
    failure,
  }))

  const withCampaignAccess = await attachCampaignAccessForTargetType(
    campaignId,
    targetType,
    seedRows,
  )

  const visible =
    filter?.mode === 'reference'
      ? filterCatalogForReference(withCampaignAccess, filter.membership)
      : filterCatalogForMembership(withCampaignAccess, filter?.membership)

  return visible.map((row) => row.failure)
}
