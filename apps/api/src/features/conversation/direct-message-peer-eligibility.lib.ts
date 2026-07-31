import type { CampaignRole, CampaignViewerParticipationState } from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

export type DirectMessageMembershipContext = {
  userId: string
  role: CampaignRole
  participationState: CampaignViewerParticipationState
}

export function isEligibleDirectMessagePeerInSharedCampaign(
  caller: DirectMessageMembershipContext,
  candidate: DirectMessageMembershipContext,
): boolean {
  if (isCampaignManager(caller.role)) return true

  if (candidate.participationState === 'staff') return true
  if (candidate.participationState === 'observer') return true
  if (candidate.participationState === 'active') {
    return caller.participationState === 'active' || caller.participationState === 'staff'
  }

  return false
}
