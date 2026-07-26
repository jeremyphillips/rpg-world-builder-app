'use client'

import type { InviteViewState } from './campaign-invite-page.lib'
import {
  InviteCompletedState,
  InviteEmailMismatchState,
  InviteExpiredState,
  InviteHomeAction,
  InviteUnauthenticatedState,
} from './campaign-invite-page-states.client'
import { InviteMessageCard } from '../components/invite-message-card.client'

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
    return (
      <InviteMessageCard
        title="Loading invitation"
        body={
          viewState.kind === 'accepting' || viewState.kind === 'ready_to_accept'
            ? 'Accepting your invitation…'
            : 'Checking your invitation status…'
        }
      />
    )
  }

  if (acceptError) {
    return (
      <InviteMessageCard
        title="Invitation unavailable"
        body={acceptError}
        action={<InviteHomeAction />}
      />
    )
  }

  if (viewState.kind === 'error') {
    return (
      <InviteMessageCard
        title="Invitation unavailable"
        body={viewState.message}
        action={<InviteHomeAction />}
      />
    )
  }

  if (viewState.kind === 'terminal') {
    return <InviteExpiredState />
  }

  if (viewState.kind === 'completed') {
    return <InviteCompletedState canOpenCampaign={viewState.canOpenCampaign} returnTo={returnTo} />
  }

  if (viewState.kind === 'email_mismatch') {
    return <InviteEmailMismatchState resolution={viewState.resolution} returnTo={returnTo} />
  }

  return <InviteUnauthenticatedState resolution={viewState.resolution} returnTo={returnTo} />
}
