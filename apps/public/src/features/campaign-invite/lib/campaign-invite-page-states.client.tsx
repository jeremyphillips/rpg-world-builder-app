import Link from 'next/link'

import {
  buildAuthContinuationUrl,
  crossAppCampaignDetailPath,
  resolveCampaignInviteExpiryLabel,
  type CampaignInvitePublicResolution,
} from '@rpg/contracts'
import { Button, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'
import { logout } from '@/features/auth/api/auth-client'

import { InviteMessageCard } from '../components/invite-message-card.client'
import {
  isPublicInviteResolution,
  resolveInviteMaskedEmail,
  type CampaignInviteResolution,
} from './campaign-invite-page.lib'

export function InviteHomeAction() {
  return (
    <Link href={ROUTES.home} className={buttonVariants({ variant: 'outline' })}>
      Return home
    </Link>
  )
}

export function InviteRevokedState() {
  return (
    <InviteMessageCard
      title="This invitation is no longer available"
      body="The campaign owner revoked this invitation. Ask them to send a new one if you still need access."
      action={
        <Link href={ROUTES.home} className={buttonVariants()}>
          Return home
        </Link>
      }
    />
  )
}

export function InviteExpiredState() {
  return (
    <InviteMessageCard
      title="This invitation has expired"
      body="Ask the campaign owner to send a new invitation."
      action={
        <Link href={ROUTES.home} className={buttonVariants()}>
          Return home
        </Link>
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
      title="This invitation has already been completed."
      body={
        canOpenCampaign
          ? 'Your campaign character is ready in the dashboard.'
          : 'Sign in with the invited account to open your campaign character.'
      }
      action={
        canOpenCampaign ? (
          <a href={crossAppCampaignDetailPath(campaignId)} className={buttonVariants()}>
            Open campaign
          </a>
        ) : (
          <Link href={buildAuthContinuationUrl('/login', returnTo)} className={buttonVariants()}>
            Sign in
          </Link>
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
            Continue to character setup
          </Button>
        ) : (
          <Button type="button" onClick={onAccept}>
            Accept invitation
          </Button>
        )
      }
    />
  )
}

export function InviteEmailMismatchState({
  resolution,
  returnTo,
}: {
  resolution: CampaignInvitePublicResolution
  returnTo: string
}) {
  const maskedEmail = resolveInviteMaskedEmail(resolution)

  return (
    <InviteMessageCard
      title="Use the invited account"
      body={`This invitation was sent to ${maskedEmail}. Sign in with that email address to continue.`}
      action={
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void logout().then(() => {
              window.location.assign(buildAuthContinuationUrl('/login', returnTo))
            })
          }}
        >
          Use another account
        </Button>
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
      body={`${resolution.inviterDisplayName} invited you to join this campaign. Sign in or create an account to continue.`}
      action={
        <>
          <Link
            href={buildAuthContinuationUrl('/login', returnTo, email ? { email } : undefined)}
            className={buttonVariants()}
          >
            Sign in
          </Link>
          <Link
            href={buildAuthContinuationUrl('/signup', returnTo, email ? { email } : undefined)}
            className={buttonVariants({ variant: 'outline' })}
          >
            Create account
          </Link>
        </>
      }
    />
  )
}

export function InviteInvalidSegmentState() {
  return (
    <InviteMessageCard
      title="Invitation unavailable"
      body="This invitation link is invalid or no longer available."
      action={<InviteHomeAction />}
    />
  )
}
