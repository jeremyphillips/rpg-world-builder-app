import type { CampaignInviteInviteeListItem, CampaignListItem } from '@rpg/contracts'

export function filterPendingInvitesForMembership(
  invites: CampaignInviteInviteeListItem[] | undefined,
  campaigns: CampaignListItem[] | undefined,
): CampaignInviteInviteeListItem[] {
  if (!invites?.length) return []

  const memberCampaignIds = new Set(campaigns?.map((campaign) => campaign.id) ?? [])
  return invites.filter((invite) => !memberCampaignIds.has(invite.campaignId))
}
