import type { MediaScope, MediaSubject } from '@rpg/contracts'

import type { WithMongoSession } from '../../lib/mongo-session'
import { MediaAssetModel, type MediaAssetDoc } from './media-asset.model'
import { MediaReferenceModel, type MediaReferenceDoc } from './media-reference.model'
import { MediaUploadIdempotencyModel } from './media-upload-idempotency.model'
import { MediaUploadSessionModel, type MediaUploadSessionDoc } from './media-upload-session.model'
import { serializeMediaScope } from './lib/scope.lib'

type ScopeFields = {
  scopeKind: MediaScope['kind']
  scopeKey: string
  campaignId?: string
  userId?: string
}

function scopeFields(scope: MediaScope): ScopeFields {
  const scopeKey = serializeMediaScope(scope)
  switch (scope.kind) {
    case 'campaign-content':
    case 'campaign-identity':
    case 'campaign-npc':
    case 'campaign-pc':
      return { scopeKind: scope.kind, scopeKey, campaignId: scope.campaignId }
    case 'user-pc':
      return { scopeKind: scope.kind, scopeKey, userId: scope.userId }
  }
}

export async function createMediaUploadSessionRecord(input: {
  id: string
  scope: MediaScope
  createdByUserId: string
  expiresAt: Date
}): Promise<MediaUploadSessionDoc> {
  const docs = await MediaUploadSessionModel.create([
    {
      _id: input.id,
      ...scopeFields(input.scope),
      createdByUserId: input.createdByUserId,
      expiresAt: input.expiresAt,
    },
  ])
  const doc = docs[0]
  if (!doc) {
    throw new Error('Failed to create media upload session.')
  }
  return doc
}

export async function findMediaUploadSessionById(
  sessionId: string,
): Promise<MediaUploadSessionDoc | null> {
  return MediaUploadSessionModel.findById(sessionId).lean<MediaUploadSessionDoc | null>()
}

export async function findMediaAssetByScopeHash(
  scope: MediaScope,
  contentHash: string,
): Promise<MediaAssetDoc | null> {
  return MediaAssetModel.findOne({
    scopeKey: serializeMediaScope(scope),
    contentHash,
    lifecycle: 'ready',
  }).lean<MediaAssetDoc | null>()
}

export async function findMediaAssetById(assetId: string): Promise<MediaAssetDoc | null> {
  return MediaAssetModel.findById(assetId).lean<MediaAssetDoc | null>()
}

export async function createMediaAssetRecord(
  input: Omit<MediaAssetDoc, 'createdAt' | 'updatedAt'>,
): Promise<MediaAssetDoc> {
  const docs = await MediaAssetModel.create([input])
  const doc = docs[0]
  if (!doc) {
    throw new Error('Failed to create media asset.')
  }
  return doc
}

export async function findMediaUploadIdempotencyRecord(input: {
  sessionId: string
  idempotencyKey: string
}): Promise<{ contentHash: string; assetId: string } | null> {
  return MediaUploadIdempotencyModel.findOne(input)
    .select('contentHash assetId')
    .lean<{ contentHash: string; assetId: string } | null>()
}

export async function recordMediaUploadIdempotency(input: {
  sessionId: string
  idempotencyKey: string
  contentHash: string
  assetId: string
}): Promise<void> {
  try {
    await MediaUploadIdempotencyModel.create([input])
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error
    }
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  )
}

export async function findMediaAssetsByIds(
  assetIds: readonly string[],
  options?: WithMongoSession,
): Promise<MediaAssetDoc[]> {
  if (assetIds.length === 0) return []
  return MediaAssetModel.find({ _id: { $in: assetIds } })
    .session(options?.session ?? null)
    .lean<MediaAssetDoc[]>()
}

export async function findMediaReferencesForSubject(
  subject: MediaSubject,
  options?: WithMongoSession,
): Promise<MediaReferenceDoc[]> {
  return MediaReferenceModel.find({ subjectKind: subject.kind, subjectId: subject.id })
    .session(options?.session ?? null)
    .lean<MediaReferenceDoc[]>()
}

export async function findMediaReferencesForAssetId(assetId: string): Promise<MediaReferenceDoc[]> {
  return MediaReferenceModel.find({ assetId }).lean<MediaReferenceDoc[]>()
}

export async function deleteMediaReferencesForSubject(
  subject: MediaSubject,
  options?: WithMongoSession,
): Promise<void> {
  await MediaReferenceModel.deleteMany(
    { subjectKind: subject.kind, subjectId: subject.id },
    { session: options?.session },
  )
}

export async function createMediaReferenceRecords(
  records: Array<Omit<MediaReferenceDoc, 'createdAt'>>,
  options?: WithMongoSession,
): Promise<void> {
  if (records.length === 0) return
  await MediaReferenceModel.create(records, { session: options?.session, ordered: true })
}

export async function incrementMediaAssetReferenceCount(
  assetId: string,
  delta: number,
  options?: WithMongoSession,
): Promise<void> {
  await MediaAssetModel.updateOne(
    { _id: assetId },
    { $inc: { referenceCount: delta } },
    { session: options?.session },
  )
}

export async function markExpiredUnreferencedMediaAssets(now: Date): Promise<number> {
  const result = await MediaAssetModel.updateMany(
    {
      lifecycle: 'ready',
      referenceCount: 0,
      leaseExpiresAt: { $lte: now },
    },
    { $set: { lifecycle: 'expired' } },
  )
  return result.modifiedCount
}

export async function claimExpiredMediaAssetForDeletion(
  assetId: string,
): Promise<MediaAssetDoc | null> {
  const doc = await MediaAssetModel.findOneAndUpdate(
    { _id: assetId, lifecycle: 'expired', referenceCount: 0 },
    { $set: { lifecycle: 'deleting' } },
    { new: false },
  ).lean<MediaAssetDoc | null>()

  return doc
}

export async function deleteMediaAssetRecord(
  assetId: string,
  options?: WithMongoSession,
): Promise<void> {
  await MediaAssetModel.deleteOne({ _id: assetId }, { session: options?.session })
}

export async function findExpiredUnreferencedMediaAssetIds(limit = 100): Promise<string[]> {
  const docs = await MediaAssetModel.find({
    lifecycle: 'expired',
    referenceCount: 0,
  })
    .select('_id')
    .limit(limit)
    .lean<Array<{ _id: string }>>()

  return docs.map((doc) => doc._id)
}
