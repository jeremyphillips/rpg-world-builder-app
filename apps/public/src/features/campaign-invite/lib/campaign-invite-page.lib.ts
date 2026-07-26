import type { CampaignInvitePublicResolution, SessionUser } from '@rpg/contracts'

export type InviteViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'terminal' }
  | { kind: 'unauthenticated'; resolution: CampaignInvitePublicResolution }
  | { kind: 'email_mismatch'; resolution: CampaignInvitePublicResolution }
  | { kind: 'accepting' }
  | { kind: 'completed'; resolution: CampaignInvitePublicResolution; canOpenCampaign: boolean }
  | { kind: 'ready_to_accept' }

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
  resolution: CampaignInvitePublicResolution,
  sessionUser: SessionUser | undefined,
): InviteViewState | null {
  if (resolution.status === 'expired') {
    return { kind: 'terminal' }
  }

  if (resolution.status === 'completed') {
    return {
      kind: 'completed',
      resolution,
      canOpenCampaign: Boolean(sessionUser),
    }
  }

  return null
}

function resolveAuthenticatedInviteState(
  resolution: CampaignInvitePublicResolution,
  sessionUser: SessionUser,
  isAccepting: boolean,
): InviteViewState {
  if (!emailsMatch(sessionUser.email, resolution.invitedEmail)) {
    return { kind: 'email_mismatch', resolution }
  }

  if (isAccepting) {
    return { kind: 'accepting' }
  }

  if (resolution.status === 'pending' || resolution.status === 'accepted') {
    return { kind: 'ready_to_accept' }
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
  resolution: CampaignInvitePublicResolution | undefined
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

export function shouldAutoAcceptInvite(viewState: InviteViewState): boolean {
  return viewState.kind === 'ready_to_accept'
}
