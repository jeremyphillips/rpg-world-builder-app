import {
  buildAuthContinuationUrl,
  crossAppCampaignDetailPath,
  resolveCampaignInviteExpiryLabel,
  type CampaignInvitePublicResolution,
} from '@rpg/contracts'
import { Button, buttonVariants } from '@rpg/ui'

import { INVITE_REVIEW_COPY } from './campaign-invite-review-copy'
import { InviteMessageCard } from './invite-message-card'
import {
  isPublicInviteResolution,
  resolveInviteMaskedEmail,
  type CampaignInviteResolution,
} from './resolve-invite-review-state'

export type CampaignInviteReviewNavigation = {
  homeHref: string
  onUseAnotherAccount?: (loginHref: string) => void
}

export function InviteHomeAction({ homeHref }: { homeHref: string }) {
  return (
    <a href={homeHref} className={buttonVariants({ variant: 'outline' })}>
      {INVITE_REVIEW_COPY.home}
    </a>
  )
}

export function InviteRevokedState({ navigation }: { navigation: CampaignInviteReviewNavigation }) {
  return (
    <InviteMessageCard
      title={INVITE_REVIEW_COPY.revoked.title}
      body={INVITE_REVIEW_COPY.revoked.body}
      action={
        <a href={navigation.homeHref} className={buttonVariants()}>
          {INVITE_REVIEW_COPY.revoked.action}
        </a>
      }
    />
  )
}

export function InviteExpiredState({ navigation }: { navigation: CampaignInviteReviewNavigation }) {
  return (
    <InviteMessageCard
      title={INVITE_REVIEW_COPY.expired.title}
      body={INVITE_REVIEW_COPY.expired.body}
      action={
        <a href={navigation.homeHref} className={buttonVariants()}>
          {INVITE_REVIEW_COPY.expired.action}
        </a>
      }
    />
  )
}

export function InviteCompletedState({
  campaignId,
  canOpenCampaign,
  returnTo,
}: {
  campaignId: string
  canOpenCampaign: boolean
  returnTo: string
}) {
  return (
    <InviteMessageCard
      title={INVITE_REVIEW_COPY.completed.title}
      body={
        canOpenCampaign
          ? INVITE_REVIEW_COPY.completed.bodyWithSession
          : INVITE_REVIEW_COPY.completed.bodyWithoutSession
      }
      action={
        canOpenCampaign ? (
          <a href={crossAppCampaignDetailPath(campaignId)} className={buttonVariants()}>
            {INVITE_REVIEW_COPY.completed.openCampaign}
          </a>
        ) : (
          <a href={buildAuthContinuationUrl('/login', returnTo)} className={buttonVariants()}>
            {INVITE_REVIEW_COPY.completed.signIn}
          </a>
        )
      }
    />
  )
}

export function InvitePendingReviewState({
  resolution,
  mode = 'accept',
  onAccept,
  onContinue,
}: {
  resolution: CampaignInviteResolution
  mode?: 'accept' | 'continue'
  onAccept?: () => void
  onContinue?: () => void
}) {
  const expiryLabel = resolveCampaignInviteExpiryLabel(resolution.expiresAt)

  return (
    <InviteMessageCard
      title={`You're invited to join ${resolution.campaignName}`}
      body={`${resolution.inviterDisplayName} invited you to join this campaign. ${expiryLabel}.`}
      action={
        mode === 'continue' ? (
          <Button type="button" onClick={onContinue}>
            {INVITE_REVIEW_COPY.pendingReview.continue}
          </Button>
        ) : (
          <Button type="button" onClick={onAccept}>
            {INVITE_REVIEW_COPY.pendingReview.accept}
          </Button>
        )
      }
    />
  )
}

export function InviteEmailMismatchState({
  resolution,
  returnTo,
  navigation,
}: {
  resolution: CampaignInvitePublicResolution
  returnTo: string
  navigation: CampaignInviteReviewNavigation
}) {
  const maskedEmail = resolveInviteMaskedEmail(resolution)
  const loginHref = buildAuthContinuationUrl('/login', returnTo)

  return (
    <InviteMessageCard
      title={INVITE_REVIEW_COPY.emailMismatch.title}
      body={`This invitation was sent to ${maskedEmail}. Sign in with that email address to continue.`}
      action={
        navigation.onUseAnotherAccount ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigation.onUseAnotherAccount?.(loginHref)}
          >
            {INVITE_REVIEW_COPY.emailMismatch.action}
          </Button>
        ) : null
      }
    />
  )
}

export function InviteUnauthenticatedState({
  resolution,
  returnTo,
}: {
  resolution: CampaignInviteResolution
  returnTo: string
}) {
  const email = isPublicInviteResolution(resolution) ? resolution.invitedEmail : undefined

  return (
    <InviteMessageCard
      title={`You're invited to join ${resolution.campaignName}`}
      body={`${resolution.inviterDisplayName} invited you to join this campaign. ${INVITE_REVIEW_COPY.unauthenticated.bodySuffix}`}
      action={
        <>
          <a
            href={buildAuthContinuationUrl('/login', returnTo, email ? { email } : undefined)}
            className={buttonVariants()}
          >
            {INVITE_REVIEW_COPY.unauthenticated.signIn}
          </a>
          <a
            href={buildAuthContinuationUrl('/signup', returnTo, email ? { email } : undefined)}
            className={buttonVariants({ variant: 'outline' })}
          >
            {INVITE_REVIEW_COPY.unauthenticated.createAccount}
          </a>
        </>
      }
    />
  )
}

export function InviteInvalidSegmentState({
  navigation,
}: {
  navigation: CampaignInviteReviewNavigation
}) {
  return (
    <InviteMessageCard
      title={INVITE_REVIEW_COPY.unavailable.title}
      body="This invitation link is invalid or no longer available."
      action={<InviteHomeAction homeHref={navigation.homeHref} />}
    />
  )
}
