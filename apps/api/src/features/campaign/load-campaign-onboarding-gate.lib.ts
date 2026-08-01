import type {
  CampaignOnboardingAccessForbiddenReason,
  CampaignOnboardingAccessIntegrityReason,
} from '@rpg/contracts'
import { resolveCampaignOnboardingAccess } from '@rpg/contracts'

import { findCampaignById } from './find-campaign-by-id'
import { loadCampaignViewerParticipationContext } from './resolve-campaign-viewer-participation-context.lib'

export type CampaignOnboardingGateResult =
  | { kind: 'not_found' }
  | { kind: 'forbidden'; reason: CampaignOnboardingAccessForbiddenReason }
  | { kind: 'integrity_error'; reason: CampaignOnboardingAccessIntegrityReason }
  | {
      kind: 'complete'
      campaignId: string
      characterId: string
      activeCharacterIds: readonly string[]
    }
  | {
      kind: 'eligible'
      campaignId: string
      membershipId: string
      mode: 'initial'
    }
  | {
      kind: 'eligible'
      campaignId: string
      membershipId: string
      mode: 'reconnect'
      characterId: string
    }

/** Sole API owner of onboarding eligibility classification for GET/POST flows. */
export async function loadCampaignOnboardingGate({
  campaignId,
  userId,
}: {
  campaignId: string
  userId: string
}): Promise<CampaignOnboardingGateResult> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    return { kind: 'not_found' }
  }

  const participation = await loadCampaignViewerParticipationContext({ campaignId, userId })
  if (!participation) {
    return { kind: 'not_found' }
  }

  const access = resolveCampaignOnboardingAccess({
    role: participation.role,
    viewerState: participation.viewerState,
    activeCharacterIds: participation.activeCharacterIds,
  })

  switch (access.kind) {
    case 'forbidden':
      return { kind: 'forbidden', reason: access.reason }
    case 'integrity_error':
      return { kind: 'integrity_error', reason: access.reason }
    case 'complete':
      return {
        kind: 'complete',
        campaignId,
        characterId: access.characterId,
        activeCharacterIds: participation.activeCharacterIds,
      }
    case 'eligible':
      if (access.mode === 'initial') {
        return {
          kind: 'eligible',
          campaignId,
          membershipId: participation.membershipId,
          mode: 'initial',
        }
      }

      return {
        kind: 'eligible',
        campaignId,
        membershipId: participation.membershipId,
        mode: 'reconnect',
        characterId: access.characterId,
      }
  }
}
