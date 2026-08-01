import type {
  CampaignInviteAuthenticatedResolution,
  CampaignInvitePublicResolution,
  CampaignInviteRouteSegment,
  SessionUser,
} from '@rpg/contracts'

export type CampaignInviteResolution =
  | CampaignInvitePublicResolution
  | CampaignInviteAuthenticatedResolution

export function isPublicInviteResolution(
  resolution: CampaignInviteResolution,
): resolution is CampaignInvitePublicResolution {
  return 'invitedEmail' in resolution
}

export type InviteViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'terminal'; reason: 'expired' | 'revoked' }
  | { kind: 'unauthenticated'; resolution: CampaignInviteResolution }
  | { kind: 'email_mismatch'; resolution: CampaignInvitePublicResolution }
  | { kind: 'accepting' }
  | { kind: 'completed'; campaignId: string; canOpenCampaign: boolean }
  | { kind: 'pending_review'; resolution: CampaignInviteResolution }
  | { kind: 'accepted_continue'; resolution: CampaignInviteResolution }

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function emailsMatch(sessionEmail: string, invitedEmail: string): boolean {
  return normalizeEmail(sessionEmail) === normalizeEmail(invitedEmail)
}

export function resolveInviteMaskedEmail(resolution: CampaignInvitePublicResolution): string {
  return resolution.invitedEmailMasked ?? resolution.invitedEmail.replace(/(.).+@/, '$1***@')
}

function resolveResolutionStatusState(
  resolution: CampaignInviteResolution,
  sessionUser: SessionUser | undefined,
): InviteViewState | null {
  if (resolution.status === 'expired') {
    return { kind: 'terminal', reason: 'expired' }
  }

  if (resolution.status === 'revoked') {
    return { kind: 'terminal', reason: 'revoked' }
  }

  if (resolution.status === 'completed') {
    return {
      kind: 'completed',
      campaignId: resolution.campaignId,
      canOpenCampaign: Boolean(sessionUser),
    }
  }

  return null
}

function resolveAuthenticatedInviteState(
  resolution: CampaignInviteResolution,
  sessionUser: SessionUser,
  isAccepting: boolean,
): InviteViewState {
  if (
    isPublicInviteResolution(resolution) &&
    !emailsMatch(sessionUser.email, resolution.invitedEmail)
  ) {
    return { kind: 'email_mismatch', resolution }
  }

  if (isAccepting) {
    return { kind: 'accepting' }
  }

  if (resolution.status === 'pending') {
    return { kind: 'pending_review', resolution }
  }

  if (resolution.status === 'accepted') {
    return { kind: 'accepted_continue', resolution }
  }

  return { kind: 'loading' }
}

export function resolveInviteViewState({
  isSessionPending,
  isResolutionPending,
  isResolutionError,
  resolutionErrorMessage,
  resolution,
  sessionUser,
  isAccepting,
}: {
  isSessionPending: boolean
  isResolutionPending: boolean
  isResolutionError: boolean
  resolutionErrorMessage: string
  resolution: CampaignInviteResolution | undefined
  sessionUser: SessionUser | undefined
  isAccepting: boolean
}): InviteViewState {
  if (isSessionPending || isResolutionPending) {
    return { kind: 'loading' }
  }

  if (isResolutionError || !resolution) {
    return { kind: 'error', message: resolutionErrorMessage }
  }

  const statusState = resolveResolutionStatusState(resolution, sessionUser)
  if (statusState) {
    return statusState
  }

  if (!sessionUser) {
    return { kind: 'unauthenticated', resolution }
  }

  return resolveAuthenticatedInviteState(resolution, sessionUser, isAccepting)
}

export function buildCampaignInviteReturnTo(segment: CampaignInviteRouteSegment): string {
  return `/campaign-invites/${segment.value}`
}
