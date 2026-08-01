import type {
  CampaignRole,
  CampaignViewerParticipationState,
  CampaignViewerState,
} from '@rpg/contracts'
import {
  filterViewerOpenParticipatingCharacterIds,
  resolveCampaignViewerParticipation,
  resolveCampaignViewerState,
} from '@rpg/contracts'

import { listCharactersForUser } from '../character'
import { findCampaignMembershipByCampaignAndUser } from './participation/create-or-confirm-player-membership'
import { listOpenParticipationsForCampaign } from './participation/campaign-character-participation.repository'

export type CampaignViewerParticipationContext = {
  membershipId: string
  role: CampaignRole
  controlledCharacterIds: string[]
  participationState: CampaignViewerParticipationState
  viewerState: CampaignViewerState
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

  const userCharacterIds = userCharacters.map((character) => character.id)
  const openParticipatingCharacterIds = filterViewerOpenParticipatingCharacterIds({
    controlledCharacterIds,
    openParticipatingCharacterIds: openParticipations.map(
      (participation) => participation.characterId,
    ),
    userCharacterIds,
  })

  const participationState = resolveCampaignViewerParticipation({
    role: membership.campaignRole as CampaignRole,
    controlledCharacterIds,
    openParticipatingCharacterIds,
  })
  const { viewerState } = resolveCampaignViewerState({
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
    viewerState,
    activeCharacterIds,
  }
}
