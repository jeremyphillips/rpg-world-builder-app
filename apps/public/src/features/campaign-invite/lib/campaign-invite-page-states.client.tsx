import Link from 'next/link'

import {
  buildAuthContinuationUrl,
  CROSS_APP_PATHS,
  type CampaignInvitePublicResolution,
} from '@rpg/contracts'
import { Button, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'
import { logout } from '@/features/auth/api/auth-client'

import { InviteMessageCard } from '../components/invite-message-card.client'
import { resolveInviteMaskedEmail } from './campaign-invite-page.lib'

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
  canOpenCampaign,
  returnTo,
}: {
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
          <a href={CROSS_APP_PATHS.dashboard} className={buttonVariants()}>
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
  resolution: CampaignInvitePublicResolution
  returnTo: string
}) {
  return (
    <InviteMessageCard
      title={`You're invited to join ${resolution.campaignName}`}
      body={`${resolution.inviterDisplayName} invited you to join this campaign. Sign in or create an account to continue.`}
      action={
        <>
          <Link
            href={buildAuthContinuationUrl('/login', returnTo, { email: resolution.invitedEmail })}
            className={buttonVariants()}
          >
            Sign in
          </Link>
          <Link
            href={buildAuthContinuationUrl('/signup', returnTo, { email: resolution.invitedEmail })}
            className={buttonVariants({ variant: 'outline' })}
          >
            Create account
          </Link>
        </>
      }
    />
  )
}
