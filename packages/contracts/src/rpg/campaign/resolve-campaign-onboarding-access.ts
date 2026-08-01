import { z } from 'zod'

import type { CampaignRole } from '../../shared/roles'
import type { CampaignViewerState } from './resolve-campaign-viewer-participation'

// ---------------------------------------------------------------------------
// Campaign onboarding access — role-first gate classification for GET/POST.
// ---------------------------------------------------------------------------

export const CAMPAIGN_ONBOARDING_ACCESS_FORBIDDEN_REASONS = [
  'not_player',
  'membership_invalid',
] as const

export const campaignOnboardingAccessForbiddenReasonSchema = z.enum(
  CAMPAIGN_ONBOARDING_ACCESS_FORBIDDEN_REASONS,
)

export type CampaignOnboardingAccessForbiddenReason = z.infer<
  typeof campaignOnboardingAccessForbiddenReasonSchema
>

export const CAMPAIGN_ONBOARDING_ACCESS_INTEGRITY_REASONS = [
  'ready_pc_without_active_character',
] as const

export const campaignOnboardingAccessIntegrityReasonSchema = z.enum(
  CAMPAIGN_ONBOARDING_ACCESS_INTEGRITY_REASONS,
)

export type CampaignOnboardingAccessIntegrityReason = z.infer<
  typeof campaignOnboardingAccessIntegrityReasonSchema
>

export const campaignOnboardingAccessForbiddenSchema = z.object({
  kind: z.literal('forbidden'),
  reason: campaignOnboardingAccessForbiddenReasonSchema,
})

export const campaignOnboardingAccessIntegrityErrorSchema = z.object({
  kind: z.literal('integrity_error'),
  reason: campaignOnboardingAccessIntegrityReasonSchema,
})

export const campaignOnboardingAccessCompleteSchema = z.object({
  kind: z.literal('complete'),
  characterId: z.string().min(1),
})

export const campaignOnboardingAccessEligibleInitialSchema = z.object({
  kind: z.literal('eligible'),
  mode: z.literal('initial'),
})

export const campaignOnboardingAccessEligibleReconnectSchema = z.object({
  kind: z.literal('eligible'),
  mode: z.literal('reconnect'),
  characterId: z.string().min(1),
})

export const campaignOnboardingAccessEligibleSchema = z.discriminatedUnion('mode', [
  campaignOnboardingAccessEligibleInitialSchema,
  campaignOnboardingAccessEligibleReconnectSchema,
])

export const campaignOnboardingAccessResultSchema = z.union([
  campaignOnboardingAccessForbiddenSchema,
  campaignOnboardingAccessIntegrityErrorSchema,
  campaignOnboardingAccessCompleteSchema,
  campaignOnboardingAccessEligibleSchema,
])

export type CampaignOnboardingAccessResult = z.infer<typeof campaignOnboardingAccessResultSchema>

export type CampaignOnboardingAccessInput = {
  role: CampaignRole
  viewerState: CampaignViewerState
  /** Used only when packaging `complete` / invariant checks for PC `ready`. */
  activeCharacterIds: readonly string[]
}

const STAFF_ROLES = new Set<CampaignRole>(['owner', 'co-owner'])

/**
 * Classifies whether a campaign member may use onboarding GET/POST flows.
 * Role is evaluated before viewer state; forbidden and integrity outcomes are
 * returned as result arms — never thrown.
 */
export function resolveCampaignOnboardingAccess(
  input: CampaignOnboardingAccessInput,
): CampaignOnboardingAccessResult {
  const { role, viewerState, activeCharacterIds } = input

  if (STAFF_ROLES.has(role) || role === 'observer') {
    return { kind: 'forbidden', reason: 'not_player' }
  }

  if (viewerState.kind === 'membership_invalid') {
    return { kind: 'forbidden', reason: 'membership_invalid' }
  }

  if (viewerState.kind === 'ready') {
    const characterId = activeCharacterIds[0]
    if (!characterId) {
      return { kind: 'integrity_error', reason: 'ready_pc_without_active_character' }
    }

    return { kind: 'complete', characterId }
  }

  if (viewerState.kind === 'onboarding_incomplete') {
    return { kind: 'eligible', mode: 'initial' }
  }

  if (viewerState.kind === 'control_stale' || viewerState.kind === 'participation_missing') {
    return {
      kind: 'eligible',
      mode: 'reconnect',
      characterId: viewerState.characterId,
    }
  }

  return { kind: 'forbidden', reason: 'membership_invalid' }
}

/** True when the viewer can self-serve recovery without staff intervention. */
export function isCampaignViewerSelfRecoverable(viewerState: CampaignViewerState): boolean {
  return (
    viewerState.kind === 'onboarding_incomplete' ||
    viewerState.kind === 'control_stale' ||
    viewerState.kind === 'participation_missing'
  )
}

/** True when recovery requires reconnecting an existing character identity. */
export function isCampaignViewerReconnectRequired(viewerState: CampaignViewerState): boolean {
  return viewerState.kind === 'control_stale' || viewerState.kind === 'participation_missing'
}

/** True when the viewer has not yet completed initial campaign onboarding. */
export function isCampaignViewerOnboardingIncomplete(viewerState: CampaignViewerState): boolean {
  return viewerState.kind === 'onboarding_incomplete'
}
