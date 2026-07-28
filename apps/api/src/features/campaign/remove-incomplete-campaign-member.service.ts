import { isValidObjectId } from 'mongoose'

import { generateInviteToken, hashInviteToken } from '../campaign-invite/campaign-invite-token'
import { revokeAcceptedInvitesForMemberRemoval } from '../campaign-invite/campaign-invite.repository'
import { HttpError } from '../../lib/http-error'
import { CampaignMembershipModel } from './campaign-membership.model'
import { listOpenParticipationsForCampaign } from './participation/campaign-character-participation.repository'
import { resolveCampaignMemberOnboardingState } from './participation/resolve-member-open-participating-character-ids.lib'
import { findPcOwnerIdsByCharacterIds } from '../character/character.repository'

type MembershipRecord = {
  _id: unknown
  userId: string
  campaignRole: string
  controlledCharacterIds?: string[]
}

export async function removeIncompleteCampaignMember(input: {
  campaignId: string
  membershipId: string
  removedByUserId: string
}): Promise<void> {
  if (!isValidObjectId(input.membershipId)) {
    throw new HttpError(404, 'not_found', 'Member not found.')
  }

  const membership = await CampaignMembershipModel.findOne({
    _id: input.membershipId,
    campaignId: input.campaignId,
  }).lean<MembershipRecord | null>()

  if (!membership) {
    throw new HttpError(404, 'not_found', 'Member not found.')
  }

  if (membership.userId === input.removedByUserId) {
    throw new HttpError(409, 'conflict', 'You cannot remove your own membership from this screen.')
  }

  if (membership.campaignRole !== 'pc') {
    throw new HttpError(409, 'conflict', 'Only player memberships can be removed.')
  }

  const controlledCharacterIds = membership.controlledCharacterIds ?? []
  if (controlledCharacterIds.length > 0) {
    throw new HttpError(
      409,
      'conflict',
      'Only members who have not finished character setup can be removed.',
    )
  }

  const openParticipations = await listOpenParticipationsForCampaign(input.campaignId)
  const openParticipationCharacterIds = openParticipations.map(
    (participation) => participation.characterId,
  )
  const characterOwnerById = await findPcOwnerIdsByCharacterIds(openParticipationCharacterIds)
  const onboardingState = resolveCampaignMemberOnboardingState({
    userId: membership.userId,
    role: 'pc',
    controlledCharacterIds,
    openParticipationCharacterIds,
    characterOwnerById,
  })

  if (onboardingState !== 'onboarding_incomplete') {
    throw new HttpError(
      409,
      'conflict',
      'Only members who have not finished character setup can be removed.',
    )
  }

  const invalidatedTokenHash = hashInviteToken(generateInviteToken())
  await revokeAcceptedInvitesForMemberRemoval(
    input.campaignId,
    membership.userId,
    input.removedByUserId,
    invalidatedTokenHash,
  )

  const deleted = await CampaignMembershipModel.deleteOne({
    _id: input.membershipId,
    campaignId: input.campaignId,
  })

  if (deleted.deletedCount === 0) {
    throw new HttpError(404, 'not_found', 'Member not found.')
  }
}
