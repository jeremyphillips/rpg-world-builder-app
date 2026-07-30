import type { CampaignInvite } from '@rpg/contracts'
import { CAMPAIGN_MANAGE_ROLES } from '@rpg/contracts'

import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { findCampaignById } from '../campaign/find-campaign-by-id'
import { findInviteById } from '../campaign-invite/campaign-invite.repository'
import { findSessionUserById } from '../user'
import { publishNotification } from './publish-notification.service'

function campaignInviteReceivedDedupeKey(inviteId: string): string {
  return `campaign-invite:${inviteId}:received`
}

function campaignInviteAcceptedDedupeKey(inviteId: string): string {
  return `campaign-invite:${inviteId}:accepted`
}

function campaignInviteCompletedDedupeKey(inviteId: string): string {
  return `campaign-invite:${inviteId}:completed`
}

async function loadCampaignName(campaignId: string): Promise<string> {
  const campaign = await findCampaignById(campaignId)
  return campaign?.identity.name ?? 'Campaign'
}

async function loadDisplayName(userId: string, fallback: string): Promise<string> {
  const user = await findSessionUserById(userId)
  return user?.displayName?.trim() || fallback
}

async function listCampaignManagerUserIds(
  campaignId: string,
  excludeUserId?: string,
): Promise<string[]> {
  const memberships = await CampaignMembershipModel.find({
    campaignId,
    campaignRole: { $in: CAMPAIGN_MANAGE_ROLES },
  })
    .select('userId')
    .lean<{ userId: string }[]>()

  return memberships
    .map((membership) => membership.userId)
    .filter((userId) => userId !== excludeUserId)
}

export async function publishCampaignInviteReceivedNotification(input: {
  invite: CampaignInvite
  invitedByUserId: string
  inviteeUserId: string
}): Promise<void> {
  const [campaignName, inviterDisplayName] = await Promise.all([
    loadCampaignName(input.invite.campaignId),
    loadDisplayName(input.invitedByUserId, 'A campaign owner'),
  ])

  await publishNotification({
    type: 'campaign.invite.received',
    recipientUserIds: [input.inviteeUserId],
    dedupeKey: campaignInviteReceivedDedupeKey(input.invite.id),
    payload: {
      inviteId: input.invite.id,
      campaignId: input.invite.campaignId,
      campaignName,
      inviterDisplayName,
    },
  })
}

export async function publishCampaignInviteAcceptedNotification(input: {
  invite: CampaignInvite
  acceptedByUserId: string
}): Promise<void> {
  const [campaignName, acceptedByDisplayName, recipientUserIds] = await Promise.all([
    loadCampaignName(input.invite.campaignId),
    loadDisplayName(input.acceptedByUserId, 'A player'),
    listCampaignManagerUserIds(input.invite.campaignId, input.acceptedByUserId),
  ])

  if (recipientUserIds.length === 0) return

  await publishNotification({
    type: 'campaign.invite.accepted',
    recipientUserIds,
    dedupeKey: campaignInviteAcceptedDedupeKey(input.invite.id),
    payload: {
      inviteId: input.invite.id,
      campaignId: input.invite.campaignId,
      campaignName,
      acceptedByDisplayName,
    },
  })
}

export async function publishCampaignInviteCompletedNotification(input: {
  inviteId: string
  completedByUserId: string
  characterId?: string
}): Promise<void> {
  const invite = await findInviteById(input.inviteId)
  if (!invite) return

  const [campaignName, completedByDisplayName, recipientUserIds] = await Promise.all([
    loadCampaignName(invite.campaignId),
    loadDisplayName(input.completedByUserId, 'A player'),
    listCampaignManagerUserIds(invite.campaignId, input.completedByUserId),
  ])

  if (recipientUserIds.length === 0) return

  await publishNotification({
    type: 'campaign.invite.completed',
    recipientUserIds,
    dedupeKey: campaignInviteCompletedDedupeKey(invite.id),
    payload: {
      inviteId: invite.id,
      campaignId: invite.campaignId,
      campaignName,
      completedByDisplayName,
      ...(input.characterId ? { characterId: input.characterId } : {}),
    },
  })
}
