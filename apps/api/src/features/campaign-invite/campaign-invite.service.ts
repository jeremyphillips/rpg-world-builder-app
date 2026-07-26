import type {
  CampaignInvite,
  CampaignInviteAdminListItem,
  CampaignInviteOnboardingContext,
  CampaignInvitePublicResolution,
} from '@rpg/contracts'
import { CAMPAIGN_INVITE_EXPIRY_DAYS } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import type { EmailProvider } from '../../services/email/email.types'
import { findCampaignById } from '../campaign/find-campaign-by-id'
import { findUserByEmail, findSessionUserById } from '../user/user.service'
import { getRulesetPatchRead } from '../vocabulary'
import { deliverCampaignInviteEmail } from './campaign-invite-delivery'
import {
  CAMPAIGN_INVITE_ROTATION_COOLDOWN_MS,
  computeInviteExpiresAt,
  isInvitePastExpiry,
  maskInvitedEmail,
  normalizeInviteEmail,
} from './campaign-invite.lib'
import {
  createInviteRecord,
  findAcceptedInviteByCampaignAndEmail,
  findActiveInviteByCampaignAndEmail,
  findInviteById,
  findInviteByTokenHash,
  listPendingInvitesByCampaign,
  markInviteAccepted,
  markInviteExpired,
  rotateInviteToken,
} from './campaign-invite.repository'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import {
  createOrConfirmPlayerMembership,
  findCampaignMembershipByCampaignAndUser,
} from './create-or-confirm-player-membership'

export type SendCampaignInviteInput = {
  campaignId: string
  email: string
  invitedByUserId: string
  provider?: EmailProvider
}

export type SendCampaignInviteResult = {
  invite: CampaignInviteAdminListItem
}

export type AcceptCampaignInviteInput = {
  rawToken: string
  userId: string
  userEmail: string
}

export type AcceptCampaignInviteResult = {
  inviteId: string
  campaignId: string
}

function toAdminListItem(invite: CampaignInvite): CampaignInviteAdminListItem {
  return {
    id: invite.id,
    email: invite.email,
    status: invite.status,
    deliveryStatus: invite.deliveryStatus,
    expiresAt: invite.expiresAt,
    ...(invite.acceptedAt ? { acceptedAt: invite.acceptedAt } : {}),
    ...(invite.completedAt ? { completedAt: invite.completedAt } : {}),
  }
}

async function loadCampaignName(campaignId: string): Promise<string> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  return campaign.identity.name
}

async function loadInviterDisplayName(userId: string): Promise<string> {
  const user = await findSessionUserById(userId)
  return user?.displayName?.trim() || 'A campaign owner'
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

async function expireInviteIfNeeded(invite: CampaignInvite): Promise<CampaignInvite> {
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

async function deliverInviteEmail(
  invite: CampaignInvite,
  rawToken: string,
  invitedByUserId: string,
  provider?: EmailProvider,
): Promise<CampaignInvite> {
  const [campaignName, inviterName] = await Promise.all([
    loadCampaignName(invite.campaignId),
    loadInviterDisplayName(invitedByUserId),
  ])

  const deliveryStatus = await deliverCampaignInviteEmail({
    inviteId: invite.id,
    campaignName,
    inviterName,
    recipientEmail: invite.email,
    rawToken,
    provider,
  })

  const refreshed = await findInviteById(invite.id)
  if (!refreshed) {
    throw new HttpError(500, 'internal_error', 'Invite disappeared after delivery attempt.')
  }

  if (deliveryStatus === 'failed') {
    return refreshed
  }

  return refreshed
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

function assertInviteAcceptable(currentInvite: CampaignInvite): void {
  if (currentInvite.status === 'completed') {
    throw new HttpError(409, 'conflict', 'This invitation has already been completed.')
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

async function loadInviteForTokenAction(rawToken: string): Promise<CampaignInvite> {
  const invite = await findInviteByTokenHash(hashInviteToken(rawToken))
  if (!invite) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }
  return expireInviteIfNeeded(invite)
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
  })

  if (currentInvite.status === 'accepted' && currentInvite.acceptedByUserId === input.userId) {
    return { inviteId: currentInvite.id, campaignId: currentInvite.campaignId }
  }

  const accepted = await markInviteAccepted(currentInvite.id, input.userId, acceptedAt)
  if (!accepted) {
    throw new HttpError(500, 'internal_error', 'Failed to accept invitation.')
  }

  return { inviteId: accepted.id, campaignId: accepted.campaignId }
}

export async function getCampaignInviteOnboardingContext({
  inviteId,
  userId,
}: {
  inviteId: string
  userId: string
}): Promise<CampaignInviteOnboardingContext> {
  const invite = await findInviteById(inviteId)
  if (!invite) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }

  const currentInvite = await expireInviteIfNeeded(invite)

  if (currentInvite.status === 'completed') {
    if (currentInvite.acceptedByUserId !== userId) {
      throw new HttpError(403, 'forbidden', 'This invitation belongs to another user.')
    }
    if (!currentInvite.completedCharacterId) {
      throw new HttpError(500, 'integrity_error', 'Completed invite is missing character data.')
    }
    return {
      status: 'completed',
      campaignId: currentInvite.campaignId,
      characterId: currentInvite.completedCharacterId,
    }
  }

  if (currentInvite.status !== 'accepted') {
    throw new HttpError(409, 'conflict', 'Invitation is not ready for onboarding.')
  }
  if (isInvitePastExpiry(currentInvite.expiresAt)) {
    throw new HttpError(410, 'expired', 'This invitation has expired.')
  }
  if (currentInvite.acceptedByUserId !== userId) {
    throw new HttpError(403, 'forbidden', 'This invitation belongs to another user.')
  }

  const membership = await findCampaignMembershipByCampaignAndUser(currentInvite.campaignId, userId)
  if (!membership) {
    throw new HttpError(
      500,
      'integrity_error',
      'Accepted invitation is missing the expected campaign membership.',
    )
  }

  const campaign = await findCampaignById(currentInvite.campaignId)
  if (!campaign) {
    throw new HttpError(500, 'integrity_error', 'Campaign for this invitation no longer exists.')
  }

  const patch = await getRulesetPatchRead(currentInvite.campaignId)
  const startingLevel = patch?.characterCreation.startingLevel ?? 1

  return {
    status: 'accepted',
    inviteId: currentInvite.id,
    campaign: {
      id: campaign.id,
      name: campaign.identity.name,
    },
    membership: {
      id: String(membership._id),
      role: 'pc',
    },
    startingLevel,
    expiresAt: currentInvite.expiresAt,
  }
}

export async function listCampaignInvitesForOverview(
  campaignId: string,
): Promise<CampaignInviteAdminListItem[]> {
  const invites = await listPendingInvitesByCampaign(campaignId)
  return invites.map(toAdminListItem)
}

export { CAMPAIGN_INVITE_EXPIRY_DAYS }
