import { isValidObjectId } from 'mongoose'

import type { CampaignInvite } from '@rpg/contracts'

import type { WithMongoSession } from '../../lib/mongo-session'
import { CampaignInviteModel, type CampaignInviteSchemaType } from './campaign-invite.model'
import { toCampaignInvite } from './to-campaign-invite'

type CampaignInviteRecord = CampaignInviteSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

export type CreateInviteRecordInput = {
  campaignId: string
  email: string
  normalizedEmail: string
  tokenHash: string
  expiresAt: Date
  invitedByUserId: string
}

const ACTIVE_INVITE_STATUSES = ['pending', 'accepted'] as const

export async function createInviteRecord(input: CreateInviteRecordInput): Promise<CampaignInvite> {
  const doc = await CampaignInviteModel.create({
    campaignId: input.campaignId,
    email: input.email,
    normalizedEmail: input.normalizedEmail,
    status: 'pending',
    deliveryStatus: 'pending',
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    invitedByUserId: input.invitedByUserId,
    deliveryAttempts: 0,
  })
  return toCampaignInvite(doc.toObject() as CampaignInviteRecord)
}

export async function findInviteById(
  inviteId: string,
  options?: WithMongoSession,
): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const doc = await CampaignInviteModel.findById(inviteId)
    .session(options?.session ?? null)
    .lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function findInviteByTokenHash(tokenHash: string): Promise<CampaignInvite | null> {
  const doc = await CampaignInviteModel.findOne({ tokenHash }).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function findActiveInviteByCampaignAndEmail(
  campaignId: string,
  normalizedEmail: string,
): Promise<CampaignInvite | null> {
  const doc = await CampaignInviteModel.findOne({
    campaignId,
    normalizedEmail,
    status: { $in: ACTIVE_INVITE_STATUSES },
  }).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function findAcceptedInviteByCampaignAndEmail(
  campaignId: string,
  normalizedEmail: string,
): Promise<CampaignInvite | null> {
  const doc = await CampaignInviteModel.findOne({
    campaignId,
    normalizedEmail,
    status: 'accepted',
  }).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function findAcceptedInvitesByCampaignAndAcceptedUserId(
  campaignId: string,
  acceptedByUserId: string,
): Promise<CampaignInvite[]> {
  const docs = await CampaignInviteModel.find({
    campaignId,
    acceptedByUserId,
    status: 'accepted',
  })
    .sort({ acceptedAt: -1, updatedAt: -1 })
    .lean<CampaignInviteRecord[]>()

  return docs.map(toCampaignInvite)
}

export async function listPendingInvitesByCampaign(campaignId: string): Promise<CampaignInvite[]> {
  const docs = await CampaignInviteModel.find({ campaignId, status: 'pending' })
    .sort({ createdAt: -1 })
    .lean<CampaignInviteRecord[]>()
  return docs.map(toCampaignInvite)
}

export async function rotateInviteToken(
  inviteId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const doc = await CampaignInviteModel.findOneAndUpdate(
    { _id: inviteId, status: 'pending' },
    { $set: { tokenHash, expiresAt } },
    { returnDocument: 'after' },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function beginInviteDeliveryAttempt(inviteId: string): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const now = new Date()
  const doc = await CampaignInviteModel.findByIdAndUpdate(
    inviteId,
    {
      $inc: { deliveryAttempts: 1 },
      $set: { lastDeliveryAttemptAt: now },
    },
    { returnDocument: 'after' },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function markInviteSent(inviteId: string): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const now = new Date()
  const doc = await CampaignInviteModel.findByIdAndUpdate(
    inviteId,
    {
      $set: {
        deliveryStatus: 'sent',
        sentAt: now,
        deliveryErrorCode: null,
      },
    },
    { returnDocument: 'after' },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function markInviteDeliveryFailed(
  inviteId: string,
  errorCode: string,
): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const doc = await CampaignInviteModel.findByIdAndUpdate(
    inviteId,
    {
      $set: {
        deliveryStatus: 'failed',
        deliveryErrorCode: errorCode,
      },
    },
    { returnDocument: 'after' },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function markInviteAccepted(
  inviteId: string,
  acceptedByUserId: string,
  acceptedAt: Date,
): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const doc = await CampaignInviteModel.findByIdAndUpdate(
    inviteId,
    {
      $set: {
        status: 'accepted',
        acceptedByUserId,
        acceptedAt,
      },
    },
    { returnDocument: 'after' },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function markInviteCompleted(
  inviteId: string,
  completedCharacterId: string,
  completedAt: Date,
  options?: WithMongoSession,
): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const doc = await CampaignInviteModel.findOneAndUpdate(
    { _id: inviteId, status: 'accepted' },
    {
      $set: {
        status: 'completed',
        completedCharacterId,
        completedAt,
      },
    },
    { returnDocument: 'after', session: options?.session },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function markInviteExpired(inviteId: string): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const doc = await CampaignInviteModel.findOneAndUpdate(
    { _id: inviteId, status: { $in: ['pending', 'accepted'] } },
    { $set: { status: 'expired' } },
    { returnDocument: 'after' },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function markInviteRevoked(
  inviteId: string,
  revokedByUserId: string,
  invalidatedTokenHash: string,
): Promise<CampaignInvite | null> {
  if (!isValidObjectId(inviteId)) return null
  const doc = await CampaignInviteModel.findOneAndUpdate(
    { _id: inviteId, status: 'pending' },
    {
      $set: {
        status: 'revoked',
        revokedAt: new Date(),
        revokedByUserId,
        tokenHash: invalidatedTokenHash,
      },
    },
    { returnDocument: 'after' },
  ).lean<CampaignInviteRecord | null>()
  if (!doc) return null
  return toCampaignInvite(doc)
}

export async function revokeAcceptedInvitesForMemberRemoval(
  campaignId: string,
  acceptedByUserId: string,
  revokedByUserId: string,
  invalidatedTokenHash: string,
): Promise<number> {
  const result = await CampaignInviteModel.updateMany(
    {
      campaignId,
      acceptedByUserId,
      status: 'accepted',
    },
    {
      $set: {
        status: 'revoked',
        revokedAt: new Date(),
        revokedByUserId,
        tokenHash: invalidatedTokenHash,
      },
    },
  )

  return result.modifiedCount
}
