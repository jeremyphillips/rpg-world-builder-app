import type { MediaScope } from '@rpg/contracts'

import { MediaAssetModel, type MediaAssetDoc } from './media-asset.model'
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
      return { scopeKind: scope.kind, scopeKey, campaignId: scope.campaignId }
    case 'campaign-npc':
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
