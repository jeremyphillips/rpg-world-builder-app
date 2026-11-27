import type { CatalogOverlayListFailure, ContentAccessTargetType } from '@rpg/contracts'

import { attachCampaignAccessForTargetType } from './content-campaign-access.service'
import {
  applyCatalogListFilter,
  catalogListModeIncludesOverlayFailures,
  type CatalogListFilter,
} from './apply-catalog-list-filter'

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
  if (failures.length === 0 || !catalogListModeIncludesOverlayFailures(filter)) {
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

  return applyCatalogListFilter(withCampaignAccess, filter).map((row) => row.failure)
}
