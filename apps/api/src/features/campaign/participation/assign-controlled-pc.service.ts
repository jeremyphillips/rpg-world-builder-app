import { isValidObjectId } from 'mongoose'

import { HttpError } from '../../../lib/http-error'
import { CampaignMembershipModel } from '../campaign-membership.model'
import { findPcForUser } from '../../character/character.repository'
import {
  attachCharacterToCampaign,
  findOpenParticipationForCharacter,
} from './campaign-character-participation.repository'

export async function addControlledCharacterToMembership({
  membershipId,
  characterId,
}: {
  membershipId: string
  characterId: string
}): Promise<boolean> {
  if (!isValidObjectId(membershipId)) return false

  const result = await CampaignMembershipModel.updateOne(
    { _id: membershipId, controlledCharacterIds: { $ne: characterId } },
    { $addToSet: { controlledCharacterIds: characterId } },
  )

  return result.matchedCount === 1
}

export async function assignControlledPcToCampaignMember({
  campaignId,
  membershipId,
  characterId,
}: {
  campaignId: string
  membershipId: string
  characterId: string
}): Promise<void> {
  if (!isValidObjectId(membershipId) || !isValidObjectId(characterId)) {
    throw HttpError.badRequest('Invalid membership or character id.')
  }

  const membership = await CampaignMembershipModel.findById(membershipId).lean()
  if (!membership || membership.campaignId !== campaignId) {
    throw new HttpError(404, 'not_found', 'Campaign membership not found.')
  }

  const character = await findPcForUser(characterId, membership.userId)
  if (!character) {
    throw HttpError.badRequest('Character not found or not owned by this member.')
  }

  const existingParticipation = await findOpenParticipationForCharacter(characterId)
  if (existingParticipation && existingParticipation.campaignId !== campaignId) {
    throw HttpError.badRequest('Character already participates in another campaign.')
  }

  const duplicateControl = await CampaignMembershipModel.findOne({
    campaignId,
    _id: { $ne: membershipId },
    controlledCharacterIds: characterId,
  }).lean()
  if (duplicateControl) {
    throw HttpError.badRequest(
      'Character is already controlled by another member in this campaign.',
    )
  }

  const joinedAt = new Date().toISOString()

  try {
    if (!existingParticipation) {
      await attachCharacterToCampaign({ campaignId, characterId, joinedAt })
    }

    await addControlledCharacterToMembership({ membershipId, characterId })
  } catch (err) {
    await CampaignMembershipModel.updateOne(
      { _id: membershipId },
      { $pull: { controlledCharacterIds: characterId } },
    )
    throw err
  }
}
