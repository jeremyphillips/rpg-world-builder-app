import { assignControlledPcToCampaignMember } from '../../features/campaign/participation/assign-controlled-pc.service'
import { attachCharacterToCampaign } from '../../features/campaign/participation/campaign-character-participation.repository'
import { CampaignMembershipModel } from '../../features/campaign/campaign-membership.model'

/** Seeds/tests: create open participation and controlled-character assignment for a PC member. */
export async function assignPcToCampaignMember({
  campaignId,
  membershipId,
  characterId,
}: {
  campaignId: string
  membershipId: string
  characterId: string
}): Promise<void> {
  await assignControlledPcToCampaignMember({ campaignId, membershipId, characterId })
}

/** Seeds/tests: create open participation only (no control assignment). */
export async function seedCharacterParticipation({
  campaignId,
  characterId,
  joinedAt = new Date().toISOString(),
}: {
  campaignId: string
  characterId: string
  joinedAt?: string
}): Promise<void> {
  await attachCharacterToCampaign({ campaignId, characterId, joinedAt })
}

/** Legacy test helper — sets controlledCharacterIds and ensures participation exists. */
export async function setMembershipControlledPcs({
  campaignId,
  userId,
  controlledCharacterIds,
}: {
  campaignId: string
  userId: string
  controlledCharacterIds: string[]
}): Promise<void> {
  const membership = await CampaignMembershipModel.findOne({ campaignId, userId }).lean()
  if (!membership) {
    throw new Error(`Membership not found for ${userId} in ${campaignId}`)
  }

  for (const characterId of controlledCharacterIds) {
    await assignControlledPcToCampaignMember({
      campaignId,
      membershipId: String(membership._id),
      characterId,
    })
  }
}
