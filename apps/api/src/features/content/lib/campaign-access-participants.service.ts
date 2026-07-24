import type { CampaignAccessParticipantEntry } from '@rpg/contracts'
import { isValidObjectId } from 'mongoose'

import { CampaignMembershipModel } from '../../campaign/campaign-membership.model'
import { CharacterModel } from '../../character/character.model'
import { UserModel } from '../../user/user.model'

type MembershipRow = {
  characterIds?: string[]
}

type CharacterRow = {
  _id: unknown
  name: string
  userId: string
}

type UserRow = {
  _id: unknown
  displayName: string
}

/** Lists campaign-submitted PCs available for `specific_players` grants. */
export async function listCampaignAccessParticipants(
  campaignId: string,
): Promise<CampaignAccessParticipantEntry[]> {
  const memberships = await CampaignMembershipModel.find({ campaignId })
    .select('characterIds')
    .lean<MembershipRow[]>()

  const rawPcIds = [
    ...new Set(
      memberships
        .flatMap((membership) => membership.characterIds ?? [])
        .filter((characterId) => isValidObjectId(characterId)),
    ),
  ]
  if (rawPcIds.length === 0) {
    return []
  }

  const characters = await CharacterModel.find({
    _id: { $in: rawPcIds },
    characterType: 'pc',
  })
    .select('_id name userId')
    .lean<CharacterRow[]>()

  if (characters.length === 0) {
    return []
  }

  const userIds = [...new Set(characters.map((character) => character.userId))]
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select('displayName')
    .lean<UserRow[]>()
  const displayNameByUserId = new Map(users.map((user) => [String(user._id), user.displayName]))

  return characters
    .map((character) => ({
      id: String(character._id),
      name: character.name,
      playerDisplayName: displayNameByUserId.get(character.userId) ?? 'Unknown player',
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function loadValidCampaignParticipantIds(campaignId: string): Promise<string[]> {
  const participants = await listCampaignAccessParticipants(campaignId)
  return participants.map((participant) => participant.id)
}
