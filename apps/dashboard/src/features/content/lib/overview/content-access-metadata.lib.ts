import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

/** Structured manager-facing campaign access facts for overview metadata. */
export type ManagerContentAccessState = {
  available: boolean
  visibilityMode: ResolvedContentCampaignAccess['visibilityMode']
  selectedParticipantCount: number
}

export function toManagerContentAccessState(
  campaignAccess: ResolvedContentCampaignAccess,
): ManagerContentAccessState {
  return {
    available: campaignAccess.available,
    visibilityMode: campaignAccess.visibilityMode,
    selectedParticipantCount: campaignAccess.participantIds.length,
  }
}
