import type { CampaignInvite, CampaignInviteAdminListItem } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import type { EmailProvider } from '../../services/email/email.types'
import { findCampaignById } from '../campaign'
import { findSessionUserById } from '../user'
import { deliverCampaignInviteEmail } from './campaign-invite-delivery'
import { expireInviteIfNeeded, normalizeInviteEmail } from './campaign-invite.lib'
import { findInviteById, findInviteByTokenHash } from './campaign-invite.repository'
import { hashInviteToken } from './campaign-invite-token'

export function toAdminListItem(invite: CampaignInvite): CampaignInviteAdminListItem {
  return {
    id: invite.id,
    email: invite.email,
    status: invite.status,
    deliveryStatus: invite.deliveryStatus,
    expiresAt: invite.expiresAt,
    ...(invite.sentAt ? { sentAt: invite.sentAt } : {}),
    ...(invite.acceptedAt ? { acceptedAt: invite.acceptedAt } : {}),
    ...(invite.completedAt ? { completedAt: invite.completedAt } : {}),
  }
}

export async function loadCampaignName(campaignId: string): Promise<string> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  return campaign.identity.name
}

export async function loadInviterDisplayName(userId: string): Promise<string> {
  const user = await findSessionUserById(userId)
  return user?.displayName?.trim() || 'A campaign owner'
}

export async function deliverInviteEmail(
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

export async function loadInviteForTokenAction(rawToken: string): Promise<CampaignInvite> {
  const invite = await findInviteByTokenHash(hashInviteToken(rawToken))
  if (!invite) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }
  return expireInviteIfNeeded(invite)
}

export async function loadManagedInvite(
  campaignId: string,
  inviteId: string,
): Promise<CampaignInvite> {
  const invite = await findInviteById(inviteId)
  if (!invite || invite.campaignId !== campaignId) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }
  return expireInviteIfNeeded(invite)
}

export async function loadInviteForAuthenticatedAction(
  inviteId: string,
  userEmail: string,
): Promise<CampaignInvite> {
  const invite = await findInviteById(inviteId)
  if (!invite) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }

  const { normalizedEmail } = normalizeInviteEmail(userEmail)
  if (normalizedEmail !== invite.normalizedEmail) {
    throw new HttpError(404, 'not_found', 'Invitation not found.')
  }

  return expireInviteIfNeeded(invite)
}
