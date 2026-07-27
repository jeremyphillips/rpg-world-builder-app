import type { CampaignRole, CampaignViewerParticipationState } from '@rpg/contracts'
import { resolveCampaignViewerParticipation } from '@rpg/contracts'

import { listCharactersForUser } from '../character/character.service'
import { findCampaignMembershipByCampaignAndUser } from '../campaign-invite/create-or-confirm-player-membership'
import { listOpenParticipationsForCampaign } from './participation/campaign-character-participation.repository'

export type CampaignViewerParticipationContext = {
  membershipId: string
  role: CampaignRole
  controlledCharacterIds: string[]
  participationState: CampaignViewerParticipationState
  activeCharacterIds: string[]
}

export async function loadCampaignViewerParticipationContext({
  campaignId,
  userId,
}: {
  campaignId: string
  userId: string
}): Promise<CampaignViewerParticipationContext | null> {
  const membership = await findCampaignMembershipByCampaignAndUser(campaignId, userId)
  if (!membership) return null

  const controlledCharacterIds = membership.controlledCharacterIds ?? []
  const [openParticipations, userCharacters] = await Promise.all([
    listOpenParticipationsForCampaign(campaignId),
    listCharactersForUser(userId),
  ])

  const userCharacterIds = new Set(userCharacters.map((character) => character.id))
  const openParticipatingCharacterIds = openParticipations
    .map((participation) => participation.characterId)
    .filter(
      (characterId) =>
        controlledCharacterIds.includes(characterId) || userCharacterIds.has(characterId),
    )

  const participationState = resolveCampaignViewerParticipation({
    role: membership.campaignRole as CampaignRole,
    controlledCharacterIds,
    openParticipatingCharacterIds,
  })

  const openParticipatingIds = new Set(openParticipatingCharacterIds)
  const activeCharacterIds = controlledCharacterIds.filter((characterId) =>
    openParticipatingIds.has(characterId),
  )

  return {
    membershipId: String(membership._id),
    role: membership.campaignRole as CampaignRole,
    controlledCharacterIds,
    participationState,
    activeCharacterIds,
  }
}
