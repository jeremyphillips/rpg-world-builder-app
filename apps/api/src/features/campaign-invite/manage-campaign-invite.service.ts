import type { CampaignInvite, CampaignInviteAdminListItem } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import type { EmailProvider } from '../../services/email/email.types'
import { buildCampaignInviteUrl } from '../../services/email/email.service'
import { CAMPAIGN_INVITE_ROTATION_COOLDOWN_MS, computeInviteExpiresAt } from './campaign-invite.lib'
import {
  listPendingInvitesByCampaign,
  markInviteRevoked,
  rotateInviteToken,
} from './campaign-invite.repository'
import {
  deliverInviteEmail,
  loadManagedInvite,
  toAdminListItem,
} from './campaign-invite-service.lib'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'

function assertInviteShareable(invite: CampaignInvite): void {
  if (invite.status !== 'pending') {
    throw new HttpError(409, 'conflict', 'Only pending invitations can share a new link.')
  }
}

function assertInviteRevocable(invite: CampaignInvite): void {
  if (invite.status === 'completed') {
    throw new HttpError(409, 'conflict', 'Completed invitations cannot be revoked.')
  }
  if (invite.status === 'expired') {
    throw new HttpError(409, 'conflict', 'Expired invitations cannot be revoked.')
  }
  if (invite.status === 'revoked') {
    throw new HttpError(409, 'conflict', 'This invitation has already been revoked.')
  }
  if (invite.status === 'accepted') {
    throw new HttpError(
      409,
      'conflict',
      'Accepted invitations cannot be revoked. Remove the member instead.',
    )
  }
  if (invite.status !== 'pending') {
    throw new HttpError(409, 'conflict', 'Invitation cannot be revoked in its current state.')
  }
}

function assertInviteRotationCooldown(invite: CampaignInvite): void {
  const cooldownElapsed = Date.now() - new Date(invite.updatedAt).getTime()
  if (cooldownElapsed < CAMPAIGN_INVITE_ROTATION_COOLDOWN_MS) {
    throw new HttpError(429, 'cooldown', 'An invitation was sent recently. Try again in a minute.')
  }
}

export async function listCampaignInvitesForOverview(
  campaignId: string,
): Promise<CampaignInviteAdminListItem[]> {
  const invites = await listPendingInvitesByCampaign(campaignId)
  return invites.map(toAdminListItem)
}

export type ShareCampaignInviteLinkInput = {
  campaignId: string
  inviteId: string
  invitedByUserId: string
  provider?: EmailProvider
}

export type ShareCampaignInviteLinkResult = {
  inviteUrl: string
}

export async function shareCampaignInviteLink(
  input: ShareCampaignInviteLinkInput,
): Promise<ShareCampaignInviteLinkResult> {
  const currentInvite = await loadManagedInvite(input.campaignId, input.inviteId)
  assertInviteShareable(currentInvite)
  assertInviteRotationCooldown(currentInvite)

  const rawToken = generateInviteToken()
  const tokenHash = hashInviteToken(rawToken)
  const expiresAt = computeInviteExpiresAt()

  const rotated = await rotateInviteToken(currentInvite.id, tokenHash, expiresAt)
  if (!rotated) {
    throw new HttpError(409, 'conflict', 'Only pending invitations can share a new link.')
  }

  await deliverInviteEmail(rotated, rawToken, input.invitedByUserId, input.provider)

  return { inviteUrl: buildCampaignInviteUrl(rawToken) }
}

export type RevokeCampaignInviteInput = {
  campaignId: string
  inviteId: string
  revokedByUserId: string
}

export async function revokeCampaignInvite(input: RevokeCampaignInviteInput): Promise<void> {
  const currentInvite = await loadManagedInvite(input.campaignId, input.inviteId)
  assertInviteRevocable(currentInvite)

  const invalidatedTokenHash = hashInviteToken(generateInviteToken())
  const revoked = await markInviteRevoked(
    currentInvite.id,
    input.revokedByUserId,
    invalidatedTokenHash,
  )
  if (!revoked) {
    throw new HttpError(409, 'conflict', 'Invitation cannot be revoked in its current state.')
  }
}
