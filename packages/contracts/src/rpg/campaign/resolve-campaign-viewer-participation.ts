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

// ---------------------------------------------------------------------------
// Campaign viewer state — actionable recovery model for list rows and nav.
// ---------------------------------------------------------------------------

export const CAMPAIGN_RECOVERY_REASONS = [
  'no_controlled_character',
  'controlled_character_without_open_participation',
  'open_participation_without_control',
  'unsupported_membership_role',
] as const

export const campaignRecoveryReasonSchema = z.enum(CAMPAIGN_RECOVERY_REASONS)

export type CampaignRecoveryReason = z.infer<typeof campaignRecoveryReasonSchema>

export const campaignViewerStateReadySchema = z.object({ kind: z.literal('ready') })

export const campaignViewerStateOnboardingIncompleteSchema = z.object({
  kind: z.literal('onboarding_incomplete'),
})

export const campaignViewerStateParticipationMissingSchema = z.object({
  kind: z.literal('participation_missing'),
  characterId: z.string().min(1).optional(),
})

export const campaignViewerStateControlStaleSchema = z.object({
  kind: z.literal('control_stale'),
  characterId: z.string().min(1).optional(),
})

export const campaignViewerStateMembershipInvalidSchema = z.object({
  kind: z.literal('membership_invalid'),
})

export const campaignViewerStateSchema = z.discriminatedUnion('kind', [
  campaignViewerStateReadySchema,
  campaignViewerStateOnboardingIncompleteSchema,
  campaignViewerStateParticipationMissingSchema,
  campaignViewerStateControlStaleSchema,
  campaignViewerStateMembershipInvalidSchema,
])

export type CampaignViewerState = z.infer<typeof campaignViewerStateSchema>

export type CampaignViewerStateResult = {
  viewerState: CampaignViewerState
  recoveryReason?: CampaignRecoveryReason
}

/** Filters campaign-wide open participations to viewer-relevant characters. */
export function filterViewerOpenParticipatingCharacterIds({
  controlledCharacterIds,
  openParticipatingCharacterIds,
  userCharacterIds,
}: {
  controlledCharacterIds: readonly string[]
  openParticipatingCharacterIds: readonly string[]
  userCharacterIds: readonly string[]
}): string[] {
  const userCharacterIdSet = new Set(userCharacterIds)
  return openParticipatingCharacterIds.filter(
    (characterId) =>
      controlledCharacterIds.includes(characterId) || userCharacterIdSet.has(characterId),
  )
}

/** Derives actionable viewer state from membership control and viewer-scoped open roster. */
export function resolveCampaignViewerState(
  input: CampaignViewerParticipationInput,
): CampaignViewerStateResult {
  const { role, controlledCharacterIds, openParticipatingCharacterIds } = input

  if (role === null) {
    return {
      viewerState: { kind: 'membership_invalid' },
      recoveryReason: 'unsupported_membership_role',
    }
  }

  if (STAFF_ROLES.has(role) || role === 'observer') {
    return { viewerState: { kind: 'ready' } }
  }

  if (role !== 'pc') {
    return {
      viewerState: { kind: 'membership_invalid' },
      recoveryReason: 'unsupported_membership_role',
    }
  }

  const openParticipatingIds = new Set(openParticipatingCharacterIds)
  const hasActivePc = controlledCharacterIds.some((characterId) =>
    openParticipatingIds.has(characterId),
  )

  if (hasActivePc) {
    return { viewerState: { kind: 'ready' } }
  }

  if (controlledCharacterIds.length > 0) {
    return {
      viewerState: {
        kind: 'control_stale',
        characterId: controlledCharacterIds[0],
      },
      recoveryReason: 'controlled_character_without_open_participation',
    }
  }

  const openWithoutControl = openParticipatingCharacterIds.filter(
    (characterId) => !controlledCharacterIds.includes(characterId),
  )

  if (openWithoutControl.length > 0) {
    return {
      viewerState: {
        kind: 'participation_missing',
        characterId: openWithoutControl[0],
      },
      recoveryReason: 'open_participation_without_control',
    }
  }

  return {
    viewerState: { kind: 'onboarding_incomplete' },
    recoveryReason: 'no_controlled_character',
  }
}
