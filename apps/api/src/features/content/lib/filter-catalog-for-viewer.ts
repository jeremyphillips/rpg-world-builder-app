import {
  CAMPAIGN_MANAGE_ROLES,
  type CampaignManageRole,
  type ContentPlayActor,
  type ResolvedContentCampaignAccess,
  buildContentViewerFromCampaignContext,
  isContentPlayableFor,
  isContentVisibleToViewer,
  resolveCatalogFilterPcCharacterIds,
} from '@rpg/contracts'

export type CatalogMembershipFilterInput = {
  campaignRole: string
  pcCharacterIds: string[]
  playActorCharacterId?: string
}

export type CatalogPlayFilterInput = {
  campaignRole: string
  playActor: ContentPlayActor
}

type CatalogListRow = {
  status?: string
  campaignAccess: ResolvedContentCampaignAccess
}

function excludeDraftsForNonManagers<T extends CatalogListRow>(
  items: T[],
  campaignRole: string,
): T[] {
  const isManager = CAMPAIGN_MANAGE_ROLES.includes(campaignRole as CampaignManageRole)
  if (isManager) {
    return items
  }
  return items.filter((item) => item.status !== 'draft')
}

/** Applies draft visibility and campaign discovery policy for catalog list responses. */
export function filterCatalogForMembership<T extends CatalogListRow>(
  items: T[],
  membership: CatalogMembershipFilterInput | undefined,
): T[] {
  const pcCharacterIds = membership
    ? resolveCatalogFilterPcCharacterIds({
        campaignRole: membership.campaignRole,
        pcCharacterIds: membership.pcCharacterIds,
        playActorCharacterId: membership.playActorCharacterId,
      })
    : []

  const viewer = buildContentViewerFromCampaignContext(
    membership ? { campaignRole: membership.campaignRole, pcCharacterIds } : undefined,
  )

  return items.filter((item) => isContentVisibleToViewer(item, viewer))
}

/** Play-catalog filter — uses playable policy only; manage role does not bypass visibility. */
export function filterCatalogForPlayActor<T extends CatalogListRow>(
  items: T[],
  input: CatalogPlayFilterInput,
): T[] {
  const isManager = CAMPAIGN_MANAGE_ROLES.includes(input.campaignRole as CampaignManageRole)
  const visible = excludeDraftsForNonManagers(items, input.campaignRole)
  return visible.filter((item) => {
    if (isManager && item.status === 'draft') {
      return true
    }
    return isContentPlayableFor(item, input.playActor)
  })
}
