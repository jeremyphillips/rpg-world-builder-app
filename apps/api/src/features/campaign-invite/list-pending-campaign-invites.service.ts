import type { CampaignInviteInviteeListItem } from '@rpg/contracts'

import { CampaignMembershipModel } from '../campaign'
import { CampaignModel, type CampaignSchemaType } from '../campaign'
import { findUsersByIds } from '../user'
import { expireInviteIfNeeded, normalizeInviteEmail } from './campaign-invite.lib'
import { listPendingInvitesByNormalizedEmail } from './campaign-invite.repository'

type CampaignRecord = CampaignSchemaType & {
  _id: unknown
}

export async function listPendingCampaignInvitesForUser(
  userId: string,
  userEmail: string,
): Promise<CampaignInviteInviteeListItem[]> {
  const { normalizedEmail } = normalizeInviteEmail(userEmail)
  const [pendingInvites, memberships] = await Promise.all([
    listPendingInvitesByNormalizedEmail(normalizedEmail),
    CampaignMembershipModel.find({ userId }).select('campaignId').lean<{ campaignId: string }[]>(),
  ])

  const memberCampaignIds = new Set(memberships.map((membership) => membership.campaignId))

  const activeInvites = (
    await Promise.all(pendingInvites.map((invite) => expireInviteIfNeeded(invite)))
  ).filter((invite) => invite.status === 'pending' && !memberCampaignIds.has(invite.campaignId))

  if (activeInvites.length === 0) {
    return []
  }

  const campaignIds = [...new Set(activeInvites.map((invite) => invite.campaignId))]
  const inviterIds = [...new Set(activeInvites.map((invite) => invite.invitedByUserId))]

  const [campaignDocs, inviters] = await Promise.all([
    CampaignModel.find({ _id: { $in: campaignIds } }).lean<CampaignRecord[]>(),
    findUsersByIds(inviterIds),
  ])

  const campaignNameById = new Map(
    campaignDocs.map((doc) => [String(doc._id), doc.identity?.name?.trim() || 'Campaign']),
  )
  const inviterNameById = new Map(
    inviters.map((user) => [user.id, user.displayName?.trim() || 'A campaign owner']),
  )

  return activeInvites.map((invite) => ({
    inviteId: invite.id,
    campaignId: invite.campaignId,
    campaignName: campaignNameById.get(invite.campaignId) ?? 'Campaign',
    inviterDisplayName: inviterNameById.get(invite.invitedByUserId) ?? 'A campaign owner',
    expiresAt: invite.expiresAt,
  }))
}
