import {
  type ContentViewer,
  type ResolvedContentCampaignAccess,
  isContentVisibleToViewer,
} from '@rpg/contracts'

type CatalogOverviewRow = {
  status?: string
  campaignAccess: ResolvedContentCampaignAccess
}

/** Defense-in-depth discovery filter for overview tables — mirrors API list policy. */
export function filterCatalogRowsForViewer<T extends CatalogOverviewRow>(
  rows: readonly T[],
  viewer: ContentViewer,
): T[] {
  return rows.filter((row) => isContentVisibleToViewer(row, viewer))
}
