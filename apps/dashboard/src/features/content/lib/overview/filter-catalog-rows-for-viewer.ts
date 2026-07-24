import {
  type ContentViewer,
  type ResolvedContentCampaignAccess,
  isContentDiscoverableForViewer,
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
  const isManager = viewer.kind === 'manage'

  return rows.filter((row) => {
    if (!isManager && row.status === 'draft') {
      return false
    }

    return isContentDiscoverableForViewer(row.campaignAccess, viewer)
  })
}
