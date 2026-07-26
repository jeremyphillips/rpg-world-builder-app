import {
  CAMPAIGN_MANAGE_ROLES,
  type CampaignManageRole,
  type ResolvedContentCampaignAccess,
  buildContentViewerFromCampaignContext,
  isContentDiscoverableForViewer,
} from '@rpg/contracts'

type CampaignMembershipContext = {
  campaignRole: string
  pcCharacterIds: string[]
}

type CatalogListRow = {
  status?: string
  campaignAccess: ResolvedContentCampaignAccess
}

/** Applies draft visibility and campaign discovery policy for catalog list responses. */
export function filterCatalogForMembership<T extends CatalogListRow>(
  items: T[],
  membership: CampaignMembershipContext | undefined,
): T[] {
  const viewer = buildContentViewerFromCampaignContext(
    membership
      ? { campaignRole: membership.campaignRole, pcCharacterIds: membership.pcCharacterIds }
      : undefined,
  )
  const isManager =
    membership !== undefined &&
    CAMPAIGN_MANAGE_ROLES.includes(membership.campaignRole as CampaignManageRole)

  return items.filter((item) => {
    if (!isManager && item.status === 'draft') {
      return false
    }
    return isContentDiscoverableForViewer(item.campaignAccess, viewer)
  })
}
