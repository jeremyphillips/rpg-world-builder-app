import type { CampaignListItem, CampaignViewerState } from '@rpg/contracts'

export type CampaignRecoveryState =
  | { kind: 'ready' }
  | { kind: 'onboarding_incomplete' }
  | { kind: 'control_stale'; characterId?: string }
  | { kind: 'participation_missing'; characterId?: string }
  | { kind: 'membership_invalid' }

export function resolveCampaignRecoveryState(
  campaign: Pick<CampaignListItem, 'viewerState'>,
): CampaignRecoveryState {
  const { viewerState } = campaign

  switch (viewerState.kind) {
    case 'onboarding_incomplete':
      return { kind: 'onboarding_incomplete' }
    case 'control_stale':
      return { kind: 'control_stale', characterId: viewerState.characterId }
    case 'participation_missing':
      return { kind: 'participation_missing', characterId: viewerState.characterId }
    case 'membership_invalid':
      return { kind: 'membership_invalid' }
    default:
      return { kind: 'ready' }
  }
}

export function isCampaignRecoveryRequired(state: CampaignRecoveryState): boolean {
  return state.kind !== 'ready'
}

export function isCampaignSelfRecoverable(state: CampaignRecoveryState): boolean {
  return (
    state.kind === 'onboarding_incomplete' ||
    state.kind === 'control_stale' ||
    state.kind === 'participation_missing'
  )
}

export function isCampaignOnboardingIncomplete(state: CampaignRecoveryState): boolean {
  return state.kind === 'onboarding_incomplete'
}

export function isCampaignReconnectRequired(state: CampaignRecoveryState): boolean {
  return state.kind === 'control_stale' || state.kind === 'participation_missing'
}

export function isCampaignMembershipInvalid(state: CampaignRecoveryState): boolean {
  return state.kind === 'membership_invalid'
}

/** @deprecated Use {@link isCampaignReconnectRequired} or {@link isCampaignMembershipInvalid}. */
export function isCampaignParticipationInvalid(state: CampaignRecoveryState): boolean {
  return isCampaignReconnectRequired(state) || isCampaignMembershipInvalid(state)
}

/** @deprecated Use {@link resolveCampaignRecoveryState} and {@link isCampaignOnboardingIncomplete}. */
export function isCampaignMembershipOnboardingIncomplete(
  campaign: Pick<CampaignListItem, 'viewerState'>,
): boolean {
  return isCampaignOnboardingIncomplete(resolveCampaignRecoveryState(campaign))
}

export function resolveRecoveryCharacterId(state: CampaignRecoveryState): string | undefined {
  if (state.kind === 'control_stale' || state.kind === 'participation_missing') {
    return state.characterId
  }

  return undefined
}

export function viewerStateFromRecoveryKind(
  kind: CampaignRecoveryState['kind'],
  characterId?: string,
): CampaignViewerState {
  switch (kind) {
    case 'onboarding_incomplete':
      return { kind: 'onboarding_incomplete' }
    case 'control_stale':
      return { kind: 'control_stale', characterId }
    case 'participation_missing':
      return { kind: 'participation_missing', characterId }
    case 'membership_invalid':
      return { kind: 'membership_invalid' }
    default:
      return { kind: 'ready' }
  }
}
