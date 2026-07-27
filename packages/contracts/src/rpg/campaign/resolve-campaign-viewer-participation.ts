import { z } from 'zod'

import type { CampaignRole } from '../../shared/roles'
import type { CampaignOverviewMemberOnboardingState } from './campaign-overview-dtos'

// ---------------------------------------------------------------------------
// Campaign viewer participation — pure resolver for membership + open roster.
// ---------------------------------------------------------------------------

export const CAMPAIGN_VIEWER_PARTICIPATION_STATES = [
  'onboarding_incomplete',
  'active',
  'staff',
  'observer',
  'none',
  'invalid',
] as const

export const campaignViewerParticipationStateSchema = z.enum(CAMPAIGN_VIEWER_PARTICIPATION_STATES)

export type CampaignViewerParticipationState = z.infer<
  typeof campaignViewerParticipationStateSchema
>

export type CampaignViewerParticipationInput = {
  /** `null` when the viewer has no membership in the campaign. */
  role: CampaignRole | null
  controlledCharacterIds: string[]
  openParticipatingCharacterIds: string[]
}

const STAFF_ROLES = new Set<CampaignRole>(['owner', 'co-owner'])

function resolvePcParticipationState(
  controlledCharacterIds: string[],
  openParticipatingCharacterIds: string[],
): Extract<CampaignViewerParticipationState, 'active' | 'onboarding_incomplete' | 'invalid'> {
  const openParticipatingIds = new Set(openParticipatingCharacterIds)
  const hasActivePc = controlledCharacterIds.some((characterId) =>
    openParticipatingIds.has(characterId),
  )

  if (hasActivePc) return 'active'

  if (controlledCharacterIds.length === 0 && openParticipatingCharacterIds.length === 0) {
    return 'onboarding_incomplete'
  }

  return 'invalid'
}

/**
 * Derives the viewer's campaign participation state from membership control and
 * open PC participations. Session drafts and invite status must not influence
 * this resolver.
 */
export function resolveCampaignViewerParticipation(
  input: CampaignViewerParticipationInput,
): CampaignViewerParticipationState {
  const { role, controlledCharacterIds, openParticipatingCharacterIds } = input

  if (role === null) return 'none'
  if (STAFF_ROLES.has(role)) return 'staff'
  if (role === 'observer') return 'observer'
  if (role !== 'pc') return 'invalid'

  return resolvePcParticipationState(controlledCharacterIds, openParticipatingCharacterIds)
}

/** Maps resolver output to overview member onboarding labels for PC members. */
export function resolveCampaignOverviewMemberOnboardingState(
  state: CampaignViewerParticipationState,
): CampaignOverviewMemberOnboardingState | undefined {
  switch (state) {
    case 'active':
      return 'character_added'
    case 'onboarding_incomplete':
      return 'onboarding_incomplete'
    default:
      return undefined
  }
}
