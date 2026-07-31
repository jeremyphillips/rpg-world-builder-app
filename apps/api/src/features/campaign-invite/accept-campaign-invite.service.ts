import type { CampaignInvite, CampaignInvitePublicResolution } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { createOrConfirmPlayerMembership } from '../campaign'
import { publishCampaignInviteAcceptedNotification } from '../notification'
import { maskInvitedEmail, normalizeInviteEmail } from './campaign-invite.lib'
import { markInviteAccepted } from './campaign-invite.repository'
import {
  loadCampaignName,
  loadInviteForTokenAction,
  loadInviterDisplayName,
} from './campaign-invite-service.lib'

export type AcceptCampaignInviteInput = {
  rawToken: string
  userId: string
  userEmail: string
}

export type AcceptCampaignInviteResult = {
  inviteId: string
  campaignId: string
}

function assertInviteAcceptable(currentInvite: CampaignInvite): void {
  if (currentInvite.status === 'completed') {
    throw new HttpError(409, 'conflict', 'This invitation has already been completed.')
  }
  if (currentInvite.status === 'revoked') {
    throw new HttpError(410, 'revoked', 'This invitation has been revoked.')
  }
  if (currentInvite.status === 'expired') {
    throw new HttpError(410, 'expired', 'This invitation has expired.')
  }
  if (currentInvite.status !== 'pending' && currentInvite.status !== 'accepted') {
    throw new HttpError(409, 'conflict', 'Invitation cannot be accepted in its current state.')
  }
}

function assertInviteEmailMatches(currentInvite: CampaignInvite, userEmail: string): void {
  const { normalizedEmail } = normalizeInviteEmail(userEmail)
  if (normalizedEmail !== currentInvite.normalizedEmail) {
    throw new HttpError(
      403,
      'email_mismatch',
      'Sign in with the email address that received this invitation.',
    )
  }
}

function assertInviteAcceptedByUser(currentInvite: CampaignInvite, userId: string): void {
  if (
    currentInvite.status === 'accepted' &&
    currentInvite.acceptedByUserId &&
    currentInvite.acceptedByUserId !== userId
  ) {
    throw new HttpError(409, 'conflict', 'This invitation was already accepted by another user.')
  }
}

export async function resolveCampaignInviteByToken(
  rawToken: string,
): Promise<CampaignInvitePublicResolution> {
  const currentInvite = await loadInviteForTokenAction(rawToken)
  const [campaignName, inviterName] = await Promise.all([
    loadCampaignName(currentInvite.campaignId),
    loadInviterDisplayName(currentInvite.invitedByUserId),
  ])

  return {
    campaignName,
    inviterDisplayName: inviterName,
    invitedEmail: currentInvite.email,
    invitedEmailMasked: maskInvitedEmail(currentInvite.email),
    status: currentInvite.status,
    expiresAt: currentInvite.expiresAt,
  }
}

export async function acceptCampaignInvite(
  input: AcceptCampaignInviteInput,
): Promise<AcceptCampaignInviteResult> {
  const currentInvite = await loadInviteForTokenAction(input.rawToken)
  assertInviteAcceptable(currentInvite)
  assertInviteEmailMatches(currentInvite, input.userEmail)
  assertInviteAcceptedByUser(currentInvite, input.userId)

  const acceptedAt = currentInvite.acceptedAt ? new Date(currentInvite.acceptedAt) : new Date()

  await createOrConfirmPlayerMembership({
    campaignId: currentInvite.campaignId,
    userId: input.userId,
    joinedAt: acceptedAt,
    sourceInviteId: currentInvite.id,
  })

  if (currentInvite.status === 'accepted' && currentInvite.acceptedByUserId === input.userId) {
    return { inviteId: currentInvite.id, campaignId: currentInvite.campaignId }
  }

  const accepted = await markInviteAccepted(currentInvite.id, input.userId, acceptedAt)
  if (!accepted) {
    throw new HttpError(500, 'internal_error', 'Failed to accept invitation.')
  }

  void publishCampaignInviteAcceptedNotification({
    invite: accepted,
    acceptedByUserId: input.userId,
  }).catch((error) => {
    console.error('Failed to publish campaign invite accepted notification.', error)
  })

  return { inviteId: accepted.id, campaignId: accepted.campaignId }
}
