import type { ClientSession } from 'mongoose'
import { isValidObjectId } from 'mongoose'

import { HttpError } from '../../../lib/http-error'
import { CampaignMembershipModel } from '../campaign-membership.model'
import { findPcForUser } from '../../character/character.repository'
import {
  attachCharacterToCampaign,
  findOpenParticipationForCharacter,
} from './campaign-character-participation.repository'

type ControlledPcAssignmentContext = {
  membershipUserId: string
  existingParticipationCampaignId: string | null
}

async function loadControlledPcAssignmentContext({
  campaignId,
  membershipId,
  characterId,
  session,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  session?: ClientSession
}): Promise<ControlledPcAssignmentContext> {
  const membership = await CampaignMembershipModel.findById(membershipId)
    .session(session ?? null)
    .lean()
  if (!membership || membership.campaignId !== campaignId) {
    throw new HttpError(404, 'not_found', 'Campaign membership not found.')
  }

  const character = await findPcForUser(characterId, membership.userId, { session })
  if (!character) {
    throw HttpError.badRequest('Character not found or not owned by this member.')
  }

  const existingParticipation = await findOpenParticipationForCharacter(characterId, { session })
  if (existingParticipation && existingParticipation.campaignId !== campaignId) {
    throw HttpError.badRequest('Character already participates in another campaign.')
  }

  const duplicateControl = await CampaignMembershipModel.findOne({
    campaignId,
    _id: { $ne: membershipId },
    controlledCharacterIds: characterId,
  })
    .session(session ?? null)
    .lean()
  if (duplicateControl) {
    throw HttpError.badRequest(
      'Character is already controlled by another member in this campaign.',
    )
  }

  return {
    membershipUserId: membership.userId,
    existingParticipationCampaignId: existingParticipation?.campaignId ?? null,
  }
}

export async function addControlledCharacterToMembership({
  membershipId,
  characterId,
  session,
}: {
  membershipId: string
  characterId: string
  session?: ClientSession
}): Promise<boolean> {
  if (!isValidObjectId(membershipId)) return false

  const result = await CampaignMembershipModel.updateOne(
    { _id: membershipId, controlledCharacterIds: { $ne: characterId } },
    { $addToSet: { controlledCharacterIds: characterId } },
  ).session(session ?? null)

  return result.matchedCount === 1
}

export async function assignControlledPcToCampaignMember({
  campaignId,
  membershipId,
  characterId,
  session,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  session?: ClientSession
}): Promise<void> {
  if (!isValidObjectId(membershipId) || !isValidObjectId(characterId)) {
    throw HttpError.badRequest('Invalid membership or character id.')
  }

  const assignmentContext = await loadControlledPcAssignmentContext({
    campaignId,
    membershipId,
    characterId,
    session,
  })

  const joinedAt = new Date().toISOString()

  try {
    if (!assignmentContext.existingParticipationCampaignId) {
      await attachCharacterToCampaign({ campaignId, characterId, joinedAt, session })
    }

    await addControlledCharacterToMembership({ membershipId, characterId, session })
  } catch (err) {
    if (!session) {
      await CampaignMembershipModel.updateOne(
        { _id: membershipId },
        { $pull: { controlledCharacterIds: characterId } },
      )
    }
    throw err
  }
}
