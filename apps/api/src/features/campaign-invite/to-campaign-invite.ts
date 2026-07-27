import type { CampaignInvite } from '@rpg/contracts'

import type { CampaignInviteSchemaType } from './campaign-invite.model'

type CampaignInviteRecord = CampaignInviteSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

/** Maps a lean invite document to the API `CampaignInvite` DTO. */
export function toCampaignInvite(doc: CampaignInviteRecord): CampaignInvite {
  return {
    id: String(doc._id),
    campaignId: doc.campaignId,
    email: doc.email,
    normalizedEmail: doc.normalizedEmail,
    status: doc.status,
    deliveryStatus: doc.deliveryStatus,
    tokenHash: doc.tokenHash,
    expiresAt: doc.expiresAt.toISOString(),
    invitedByUserId: doc.invitedByUserId,
    ...(doc.acceptedByUserId ? { acceptedByUserId: doc.acceptedByUserId } : {}),
    ...(doc.acceptedAt ? { acceptedAt: doc.acceptedAt.toISOString() } : {}),
    ...(doc.completedAt ? { completedAt: doc.completedAt.toISOString() } : {}),
    ...(doc.completedCharacterId ? { completedCharacterId: doc.completedCharacterId } : {}),
    ...(doc.sentAt ? { sentAt: doc.sentAt.toISOString() } : {}),
    ...(doc.deliveryErrorCode ? { deliveryErrorCode: doc.deliveryErrorCode } : {}),
    deliveryAttempts: doc.deliveryAttempts ?? 0,
    ...(doc.lastDeliveryAttemptAt
      ? { lastDeliveryAttemptAt: doc.lastDeliveryAttemptAt.toISOString() }
      : {}),
    ...(doc.revokedAt ? { revokedAt: doc.revokedAt.toISOString() } : {}),
    ...(doc.revokedByUserId ? { revokedByUserId: doc.revokedByUserId } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}
