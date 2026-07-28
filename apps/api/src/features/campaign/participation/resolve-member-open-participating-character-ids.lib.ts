import type { CampaignOverviewMemberOnboardingState, CampaignRole } from '@rpg/contracts'
import {
  resolveCampaignOverviewMemberOnboardingState,
  resolveCampaignViewerParticipation,
} from '@rpg/contracts'

export function resolveMemberOpenParticipatingCharacterIds({
  userId,
  controlledCharacterIds,
  openParticipationCharacterIds,
  characterOwnerById,
}: {
  userId: string
  controlledCharacterIds: string[]
  openParticipationCharacterIds: string[]
  characterOwnerById: Map<string, string>
}): string[] {
  return openParticipationCharacterIds.filter(
    (characterId) =>
      controlledCharacterIds.includes(characterId) ||
      characterOwnerById.get(characterId) === userId,
  )
}

export function resolveCampaignMemberOnboardingState({
  userId,
  role,
  controlledCharacterIds,
  openParticipationCharacterIds,
  characterOwnerById,
}: {
  userId: string
  role: CampaignRole
  controlledCharacterIds: string[]
  openParticipationCharacterIds: string[]
  characterOwnerById: Map<string, string>
}): CampaignOverviewMemberOnboardingState | undefined {
  const openParticipatingCharacterIds = resolveMemberOpenParticipatingCharacterIds({
    userId,
    controlledCharacterIds,
    openParticipationCharacterIds,
    characterOwnerById,
  })
  const participationState = resolveCampaignViewerParticipation({
    role,
    controlledCharacterIds,
    openParticipatingCharacterIds,
  })
  return resolveCampaignOverviewMemberOnboardingState(participationState)
}
