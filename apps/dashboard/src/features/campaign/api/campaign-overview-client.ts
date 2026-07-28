import type {
  CampaignInviteAdminListItem,
  CampaignInviteRecipientInput,
  CampaignInviteShareLinkResult,
  CampaignOverviewMemberListItem,
  CampaignPartyPcListItem,
} from '@rpg/contracts'

import { postJson, request } from '@/lib/api-client'

const LIST_MEMBERS_ERROR = 'Could not load campaign members.'
const LIST_PARTY_ERROR = 'Could not load campaign party.'
const LIST_INVITES_ERROR = 'Could not load campaign invitations.'
const SEND_INVITE_ERROR = 'Could not send invitation.'
const SHARE_INVITE_LINK_ERROR = 'Could not share invite link.'
const REVOKE_INVITE_ERROR = 'Could not revoke invitation.'
const REMOVE_MEMBER_ERROR = 'Could not remove this member.'

export async function listCampaignMembers(
  campaignId: string,
): Promise<CampaignOverviewMemberListItem[]> {
  const { members } = await request<{ members: CampaignOverviewMemberListItem[] }>(
    `/api/campaigns/${campaignId}/members`,
    undefined,
    LIST_MEMBERS_ERROR,
  )
  return members
}

export async function listCampaignParty(campaignId: string): Promise<CampaignPartyPcListItem[]> {
  const { party } = await request<{ party: CampaignPartyPcListItem[] }>(
    `/api/campaigns/${campaignId}/party`,
    undefined,
    LIST_PARTY_ERROR,
  )
  return party
}

export async function listCampaignInvites(
  campaignId: string,
): Promise<CampaignInviteAdminListItem[]> {
  const { invites } = await request<{ invites: CampaignInviteAdminListItem[] }>(
    `/api/campaigns/${campaignId}/invites`,
    undefined,
    LIST_INVITES_ERROR,
  )
  return invites
}

export type SendCampaignInviteResult = {
  invite: CampaignInviteAdminListItem
}

export async function sendCampaignInvite(
  campaignId: string,
  input: CampaignInviteRecipientInput,
): Promise<SendCampaignInviteResult> {
  return postJson<SendCampaignInviteResult>(
    `/api/campaigns/${campaignId}/invites`,
    input,
    SEND_INVITE_ERROR,
  )
}

export async function shareCampaignInviteLink(
  campaignId: string,
  inviteId: string,
): Promise<CampaignInviteShareLinkResult> {
  return postJson<CampaignInviteShareLinkResult>(
    `/api/campaigns/${campaignId}/invites/${inviteId}/share-link`,
    {},
    SHARE_INVITE_LINK_ERROR,
  )
}

export async function revokeCampaignInvite(campaignId: string, inviteId: string): Promise<void> {
  await postJson<void>(
    `/api/campaigns/${campaignId}/invites/${inviteId}/revoke`,
    {},
    REVOKE_INVITE_ERROR,
  )
}

export async function removeIncompleteCampaignMember(
  campaignId: string,
  membershipId: string,
): Promise<void> {
  await request<void>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/members/${encodeURIComponent(membershipId)}`,
    { method: 'DELETE' },
    REMOVE_MEMBER_ERROR,
  )
}
