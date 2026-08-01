import type { CampaignListItem } from '@rpg/contracts'

export type CampaignRecoveryState =
  | { kind: 'ready' }
  | { kind: 'onboarding_incomplete' }
  | { kind: 'participation_invalid' }

export function resolveCampaignRecoveryState(
  campaign: Pick<CampaignListItem, 'viewerOnboardingState'>,
): CampaignRecoveryState {
  switch (campaign.viewerOnboardingState) {
    case 'incomplete':
      return { kind: 'onboarding_incomplete' }
    case 'invalid':
      return { kind: 'participation_invalid' }
    default:
      return { kind: 'ready' }
  }
}

export function isCampaignRecoveryRequired(state: CampaignRecoveryState): boolean {
  return state.kind === 'onboarding_incomplete' || state.kind === 'participation_invalid'
}

export function isCampaignOnboardingIncomplete(state: CampaignRecoveryState): boolean {
  return state.kind === 'onboarding_incomplete'
}

export function isCampaignParticipationInvalid(state: CampaignRecoveryState): boolean {
  return state.kind === 'participation_invalid'
}

/** @deprecated Use {@link resolveCampaignRecoveryState} and {@link isCampaignOnboardingIncomplete}. */
export function isCampaignMembershipOnboardingIncomplete(
  campaign: Pick<CampaignListItem, 'viewerOnboardingState'>,
): boolean {
  return isCampaignOnboardingIncomplete(resolveCampaignRecoveryState(campaign))
}
