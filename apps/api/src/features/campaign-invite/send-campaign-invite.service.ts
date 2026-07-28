import type { CampaignInviteAdminListItem } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import type { EmailProvider } from '../../services/email/email.types'
import { findCampaignMembershipByCampaignAndUser } from '../campaign'
import { findUserByEmail } from '../user'
import {
  CAMPAIGN_INVITE_ROTATION_COOLDOWN_MS,
  computeInviteExpiresAt,
  isInvitePastExpiry,
  normalizeInviteEmail,
} from './campaign-invite.lib'
import {
  createInviteRecord,
  findAcceptedInviteByCampaignAndEmail,
  findActiveInviteByCampaignAndEmail,
  markInviteExpired,
  rotateInviteToken,
} from './campaign-invite.repository'
import { deliverInviteEmail, toAdminListItem } from './campaign-invite-service.lib'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'

export type SendCampaignInviteInput = {
  campaignId: string
  email: string
  invitedByUserId: string
  provider?: EmailProvider
}

export type SendCampaignInviteResult = {
  invite: CampaignInviteAdminListItem
}

async function assertCanSendInvite(campaignId: string, normalizedEmail: string): Promise<void> {
  const invitedUser = await findUserByEmail(normalizedEmail)
  if (!invitedUser) return

  const membership = await findCampaignMembershipByCampaignAndUser(campaignId, invitedUser.id)
  if (!membership) return

  if ((membership.controlledCharacterIds ?? []).length > 0) {
    throw new HttpError(409, 'already_member', 'This person is already a campaign member.')
  }

  const activeAcceptedInvite = await findAcceptedInviteByCampaignAndEmail(
    campaignId,
    normalizedEmail,
  )
  if (
    activeAcceptedInvite &&
    !isInvitePastExpiry(activeAcceptedInvite.expiresAt) &&
    activeAcceptedInvite.status === 'accepted'
  ) {
    throw new HttpError(
      409,
      'invite_already_accepted',
      'This person has already accepted an invitation and still needs to finish character setup.',
    )
  }
}

export async function sendCampaignInvite(
  input: SendCampaignInviteInput,
): Promise<SendCampaignInviteResult> {
  const { email, normalizedEmail } = normalizeInviteEmail(input.email)
  await assertCanSendInvite(input.campaignId, normalizedEmail)

  const activeInviteRaw = await findActiveInviteByCampaignAndEmail(
    input.campaignId,
    normalizedEmail,
  )
  let activeInvite = activeInviteRaw
  if (activeInvite && isInvitePastExpiry(activeInvite.expiresAt)) {
    await markInviteExpired(activeInvite.id)
    activeInvite = null
  }
  const rawToken = generateInviteToken()
  const tokenHash = hashInviteToken(rawToken)
  const expiresAt = computeInviteExpiresAt()

  if (!activeInvite) {
    const invite = await createInviteRecord({
      campaignId: input.campaignId,
      email,
      normalizedEmail,
      tokenHash,
      expiresAt,
      invitedByUserId: input.invitedByUserId,
    })
    const delivered = await deliverInviteEmail(
      invite,
      rawToken,
      input.invitedByUserId,
      input.provider,
    )
    return { invite: toAdminListItem(delivered) }
  }

  if (activeInvite.status === 'accepted') {
    throw new HttpError(
      409,
      'invite_already_accepted',
      'This person has already accepted an invitation and still needs to finish character setup.',
    )
  }

  const cooldownElapsed = Date.now() - new Date(activeInvite.updatedAt).getTime()
  if (cooldownElapsed < CAMPAIGN_INVITE_ROTATION_COOLDOWN_MS) {
    throw new HttpError(429, 'cooldown', 'An invitation was sent recently. Try again in a minute.')
  }

  const rotated = await rotateInviteToken(activeInvite.id, tokenHash, expiresAt)
  if (!rotated) {
    throw new HttpError(409, 'conflict', 'Only pending invitations can be resent.')
  }

  const delivered = await deliverInviteEmail(
    rotated,
    rawToken,
    input.invitedByUserId,
    input.provider,
  )
  return { invite: toAdminListItem(delivered) }
}
