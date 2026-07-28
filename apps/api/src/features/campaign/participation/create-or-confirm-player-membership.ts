import { CAMPAIGN_INVITE_MEMBERSHIP_ROLE } from '@rpg/contracts'

import { CampaignMembershipModel } from '../campaign-membership.model'

export type PlayerMembershipResult = {
  id: string
  role: typeof CAMPAIGN_INVITE_MEMBERSHIP_ROLE
  created: boolean
}

export async function createOrConfirmPlayerMembership({
  campaignId,
  userId,
  joinedAt,
  sourceInviteId,
}: {
  campaignId: string
  userId: string
  joinedAt: Date
  sourceInviteId: string
}): Promise<PlayerMembershipResult> {
  const existing = await CampaignMembershipModel.findOne({ campaignId, userId }).lean()

  if (existing) {
    const updates: { joinedAt?: Date; sourceInviteId: string } = { sourceInviteId }
    if (!existing.joinedAt) {
      updates.joinedAt = joinedAt
    }

    await CampaignMembershipModel.updateOne({ _id: existing._id }, { $set: updates })

    return {
      id: String(existing._id),
      role: CAMPAIGN_INVITE_MEMBERSHIP_ROLE,
      created: false,
    }
  }

  const doc = await CampaignMembershipModel.create({
    campaignId,
    userId,
    campaignRole: CAMPAIGN_INVITE_MEMBERSHIP_ROLE,
    controlledCharacterIds: [],
    invitedAt: joinedAt,
    joinedAt,
    sourceInviteId,
  })

  return {
    id: String(doc._id),
    role: CAMPAIGN_INVITE_MEMBERSHIP_ROLE,
    created: true,
  }
}

export async function findCampaignMembershipByCampaignAndUser(campaignId: string, userId: string) {
  return CampaignMembershipModel.findOne({ campaignId, userId }).lean()
}
