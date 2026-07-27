import type { CampaignInvite, CompleteCampaignInviteResult } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { isInvitePastExpiry } from './campaign-invite.lib'
import { failCampaignInviteCompletion } from './campaign-invite-completion-failure.lib'
import { findInviteById, markInviteExpired } from './campaign-invite.repository'
import { findCampaignMembershipByCampaignAndUser } from './create-or-confirm-player-membership'
import {
  resolveCompletedInviteForExistingCharacter,
  resolveCompletedInviteForNewCharacter,
} from './complete-campaign-invite-idempotency.lib'

export type CampaignInviteCharacterSource =
  | { kind: 'new' }
  | { kind: 'existing'; characterId: string }

export type CampaignInviteCompletionContext = {
  invite: CampaignInvite
  acceptedInvite: CampaignInvite
  membershipId: string
}

export type CampaignInviteCompletionContextResult =
  | { kind: 'idempotent'; result: CompleteCampaignInviteResult }
  | { kind: 'ready'; context: CampaignInviteCompletionContext }

export async function expireInviteIfNeeded(invite: CampaignInvite): Promise<CampaignInvite> {
  if (
    (invite.status === 'pending' || invite.status === 'accepted') &&
    isInvitePastExpiry(invite.expiresAt)
  ) {
    const expired = await markInviteExpired(invite.id)
    if (!expired) {
      throw new HttpError(500, 'internal_error', 'Failed to expire invite.')
    }
    return expired
  }
  return invite
}

async function loadAcceptedInviteForUser({
  inviteId,
  userId,
}: {
  inviteId: string
  userId: string
}): Promise<CampaignInvite> {
  const invite = await findInviteById(inviteId)
  if (!invite) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }

  const currentInvite = await expireInviteIfNeeded(invite)

  if (currentInvite.status === 'completed') {
    failCampaignInviteCompletion({ kind: 'invite_unavailable', reason: 'already_completed' })
  }

  if (currentInvite.status === 'revoked') {
    failCampaignInviteCompletion({ kind: 'invite_unavailable', reason: 'revoked' })
  }

  if (currentInvite.status === 'expired' || isInvitePastExpiry(currentInvite.expiresAt)) {
    failCampaignInviteCompletion({ kind: 'invite_unavailable', reason: 'expired' })
  }

  if (currentInvite.status !== 'accepted') {
    failCampaignInviteCompletion({ kind: 'invite_unavailable', reason: 'not_accepted' })
  }
  if (currentInvite.acceptedByUserId !== userId) {
    failCampaignInviteCompletion({ kind: 'invite_unavailable', reason: 'not_owned' })
  }

  return currentInvite
}

export { loadAcceptedInviteForUser }

export async function resolveCampaignInviteCompletionContext({
  inviteId,
  userId,
  characterSource,
}: {
  inviteId: string
  userId: string
  characterSource: CampaignInviteCharacterSource
}): Promise<CampaignInviteCompletionContextResult> {
  const invite = await findInviteById(inviteId)
  if (!invite) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }

  const currentInvite = await expireInviteIfNeeded(invite)

  if (characterSource.kind === 'existing') {
    const completedResult = await resolveCompletedInviteForExistingCharacter({
      invite: currentInvite,
      userId,
      characterId: characterSource.characterId,
    })
    if (completedResult) {
      return { kind: 'idempotent', result: completedResult }
    }
  } else {
    const completedResult = await resolveCompletedInviteForNewCharacter({
      invite: currentInvite,
      userId,
    })
    if (completedResult) {
      return { kind: 'idempotent', result: completedResult }
    }
  }

  const acceptedInvite = await loadAcceptedInviteForUser({ inviteId, userId })
  const membership = await findCampaignMembershipByCampaignAndUser(
    acceptedInvite.campaignId,
    userId,
  )
  if (!membership) {
    throw new HttpError(
      500,
      'integrity_error',
      'Accepted invitation is missing the expected campaign membership.',
    )
  }

  return {
    kind: 'ready',
    context: {
      invite,
      acceptedInvite,
      membershipId: String(membership._id),
    },
  }
}
