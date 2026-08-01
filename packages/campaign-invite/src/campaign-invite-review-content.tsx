import { INVITE_REVIEW_COPY } from './campaign-invite-review-copy'
import {
  InviteCompletedState,
  InviteEmailMismatchState,
  InviteExpiredState,
  InviteHomeAction,
  InvitePendingReviewState,
  InviteRevokedState,
  InviteUnauthenticatedState,
  type CampaignInviteReviewNavigation,
} from './campaign-invite-review-states'
import { InviteMessageCard } from './invite-message-card'
import type { InviteViewState } from './resolve-invite-review-state'

function renderInviteLoadingState(viewState: InviteViewState) {
  const body =
    viewState.kind === 'accepting'
      ? INVITE_REVIEW_COPY.loading.accepting
      : INVITE_REVIEW_COPY.loading.resolving

  return <InviteMessageCard title="Loading invitation" body={body} />
}

function renderInviteUnavailableState(message: string, navigation: CampaignInviteReviewNavigation) {
  return (
    <InviteMessageCard
      title={INVITE_REVIEW_COPY.unavailable.title}
      body={message}
      action={<InviteHomeAction homeHref={navigation.homeHref} />}
    />
  )
}

function renderInviteTerminalState(
  reason: 'expired' | 'revoked',
  navigation: CampaignInviteReviewNavigation,
) {
  return reason === 'revoked' ? (
    <InviteRevokedState navigation={navigation} />
  ) : (
    <InviteExpiredState navigation={navigation} />
  )
}

export type CampaignInviteReviewContentProps = {
  viewState: InviteViewState
  returnTo: string
  acceptError: string | null
  onAccept: () => void
  onContinue: (campaignId: string) => void
  navigation: CampaignInviteReviewNavigation
}

export function CampaignInviteReviewContent({
  viewState,
  returnTo,
  acceptError,
  onAccept,
  onContinue,
  navigation,
}: CampaignInviteReviewContentProps) {
  if (acceptError) {
    return renderInviteUnavailableState(acceptError, navigation)
  }

  if (viewState.kind === 'loading' || viewState.kind === 'accepting') {
    return renderInviteLoadingState(viewState)
  }

  if (viewState.kind === 'error') {
    return renderInviteUnavailableState(viewState.message, navigation)
  }

  if (viewState.kind === 'terminal') {
    return renderInviteTerminalState(viewState.reason, navigation)
  }

  if (viewState.kind === 'completed') {
    return (
      <InviteCompletedState
        campaignId={viewState.campaignId}
        canOpenCampaign={viewState.canOpenCampaign}
        returnTo={returnTo}
      />
    )
  }

  if (viewState.kind === 'email_mismatch') {
    return (
      <InviteEmailMismatchState
        resolution={viewState.resolution}
        returnTo={returnTo}
        navigation={navigation}
      />
    )
  }

  if (viewState.kind === 'pending_review') {
    return <InvitePendingReviewState resolution={viewState.resolution} onAccept={onAccept} />
  }

  if (viewState.kind === 'accepted_continue') {
    return (
      <InvitePendingReviewState
        resolution={viewState.resolution}
        mode="continue"
        onContinue={() => onContinue(viewState.resolution.campaignId)}
      />
    )
  }

  return <InviteUnauthenticatedState resolution={viewState.resolution} returnTo={returnTo} />
}
