'use client'

import type { InviteViewState } from './campaign-invite-page.lib'
import {
  InviteCompletedState,
  InviteEmailMismatchState,
  InviteExpiredState,
  InviteHomeAction,
  InviteRevokedState,
  InviteUnauthenticatedState,
} from './campaign-invite-page-states.client'
import { InviteMessageCard } from '../components/invite-message-card.client'

function renderInviteLoadingState(viewState: InviteViewState) {
  const body =
    viewState.kind === 'accepting' || viewState.kind === 'ready_to_accept'
      ? 'Accepting your invitation…'
      : 'Checking your invitation status…'

  return <InviteMessageCard title="Loading invitation" body={body} />
}

function renderInviteUnavailableState(message: string) {
  return (
    <InviteMessageCard
      title="Invitation unavailable"
      body={message}
      action={<InviteHomeAction />}
    />
  )
}

function renderInviteTerminalState(reason: 'expired' | 'revoked') {
  return reason === 'revoked' ? <InviteRevokedState /> : <InviteExpiredState />
}

export function renderInviteViewState(
  viewState: InviteViewState,
  {
    returnTo,
    acceptError,
  }: {
    returnTo: string
    acceptError: string | null
  },
) {
  if (
    viewState.kind === 'loading' ||
    viewState.kind === 'accepting' ||
    viewState.kind === 'ready_to_accept'
  ) {
    return renderInviteLoadingState(viewState)
  }

  if (acceptError) {
    return renderInviteUnavailableState(acceptError)
  }

  if (viewState.kind === 'error') {
    return renderInviteUnavailableState(viewState.message)
  }

  if (viewState.kind === 'terminal') {
    return renderInviteTerminalState(viewState.reason)
  }

  if (viewState.kind === 'completed') {
    return <InviteCompletedState canOpenCampaign={viewState.canOpenCampaign} returnTo={returnTo} />
  }

  if (viewState.kind === 'email_mismatch') {
    return <InviteEmailMismatchState resolution={viewState.resolution} returnTo={returnTo} />
  }

  return <InviteUnauthenticatedState resolution={viewState.resolution} returnTo={returnTo} />
}
