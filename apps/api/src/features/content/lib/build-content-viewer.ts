import { CAMPAIGN_MANAGE_ROLES, type CampaignManageRole, type ContentViewer } from '@rpg/contracts'

type CampaignMembershipContext = {
  campaignRole: string
  characterIds: string[]
}

/** Maps API campaign membership to the contracts `ContentViewer` model. */
export function buildContentViewerFromMembership(
  membership: CampaignMembershipContext | undefined,
): ContentViewer {
  if (!membership) {
    return { kind: 'none' }
  }

  if (CAMPAIGN_MANAGE_ROLES.includes(membership.campaignRole as CampaignManageRole)) {
    return { kind: 'manage' }
  }

  if (membership.campaignRole === 'pc' && membership.characterIds.length > 0) {
    return { kind: 'pc', characterIds: membership.characterIds }
  }

  return { kind: 'none' }
}
