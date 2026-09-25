import { createHash, randomUUID } from 'node:crypto'

import type {
  CreateMediaUploadSessionInput,
  MediaAsset,
  MediaAssetUploadResponse,
  MediaRenditionPreset,
  MediaUploadSession,
  NormalizedCrop,
} from '@rpg/contracts'
import {
  CONTENT_MEDIA_MAX_ATTACHMENTS,
  CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT,
  CONTENT_MEDIA_UPLOAD_LEASE_MS,
} from '@rpg/contracts'

import { loadEnv } from '../../env'
import { HttpError } from '../../lib/http-error'
import { validateFileType } from '../uploads'
import { extensionForMime, inspectImageBuffer } from './lib/inspect-image.lib'
import { generateMediaRendition } from './lib/generate-rendition.lib'
import { assertMediaScopeAuthorized, serializeMediaScope } from './lib/scope.lib'
import { storeMediaOriginal } from './lib/storage.lib'
import { scopeFromDoc, toMediaAsset } from './lib/to-media-asset'
import {
  createMediaAssetRecord,
  createMediaUploadSessionRecord,
  findMediaAssetById,
  findMediaAssetByScopeHash,
  findMediaUploadIdempotencyRecord,
  findMediaUploadSessionById,
  recordMediaUploadIdempotency,
} from './media.repository'

function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

function toSessionDto(doc: {
  _id: string
  scopeKind: string
  campaignId?: string | null
  userId?: string | null
  expiresAt: Date
  createdAt: Date
}): MediaUploadSession {
  const { MAX_UPLOAD_BYTES } = loadEnv()
  return {
    id: doc._id,
    scope: scopeFromDoc(doc),
    expiresAt: doc.expiresAt.toISOString(),
    maxUploadBytes: MAX_UPLOAD_BYTES,
    maxAttachments: CONTENT_MEDIA_MAX_ATTACHMENTS,
    maxUploadsInFlight: CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT,
    createdAt: doc.createdAt.toISOString(),
  }
}

async function loadAuthorizedSession(
  sessionId: string,
  userId: string,
): Promise<NonNullable<Awaited<ReturnType<typeof findMediaUploadSessionById>>>> {
  const session = await findMediaUploadSessionById(sessionId)
  if (!session) {
    throw new HttpError(404, 'not_found', 'Upload session not found.')
  }

  if (session.createdByUserId !== userId) {
    throw HttpError.forbidden('Upload session belongs to another user.')
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw HttpError.badRequest('Upload session has expired.')
  }

  const scope = scopeFromDoc(session)
  await assertMediaScopeAuthorized(scope, userId)
  return session
}

async function loadAuthorizedAsset(assetId: string, userId: string): Promise<MediaAsset> {
  const doc = await findMediaAssetById(assetId)
  if (!doc) {
    throw new HttpError(404, 'not_found', 'Media asset not found.')
  }

  if (doc.lifecycle !== 'ready') {
    throw HttpError.badRequest('Media asset is not available.')
  }

  const scope = scopeFromDoc(doc)
  await assertMediaScopeAuthorized(scope, userId, 'read')
  return toMediaAsset(doc)
}

export async function createMediaUploadSession(
  input: CreateMediaUploadSessionInput,
  userId: string,
): Promise<MediaUploadSession> {
  await assertMediaScopeAuthorized(input.scope, userId)

  const now = Date.now()
  const doc = await createMediaUploadSessionRecord({
    id: randomUUID(),
    scope: input.scope,
    createdByUserId: userId,
    expiresAt: new Date(now + CONTENT_MEDIA_UPLOAD_LEASE_MS),
  })

  return toSessionDto(doc)
}

export async function uploadMediaAsset(input: {
  sessionId: string
  userId: string
  buffer: Buffer
  originalFilename: string
  idempotencyKey?: string
}): Promise<MediaAssetUploadResponse> {
  const session = await loadAuthorizedSession(input.sessionId, input.userId)
  const scope = scopeFromDoc(session)
  const contentHash = hashBuffer(input.buffer)

  if (input.idempotencyKey) {
    const existing = await findMediaUploadIdempotencyRecord({
      sessionId: input.sessionId,
      idempotencyKey: input.idempotencyKey,
    })

    if (existing) {
      if (existing.contentHash !== contentHash) {
        throw HttpError.conflict('Idempotency key was already used for a different upload.')
      }

      const asset = await loadAuthorizedAsset(existing.assetId, input.userId)
      return { sessionId: input.sessionId, asset }
    }
  }

  const deduped = await findMediaAssetByScopeHash(scope, contentHash)
  if (deduped) {
    const asset = toMediaAsset(deduped)
    if (input.idempotencyKey) {
      await recordMediaUploadIdempotency({
        sessionId: input.sessionId,
        idempotencyKey: input.idempotencyKey,
        contentHash,
        assetId: asset.id,
      })
    }
    return { sessionId: input.sessionId, asset }
  }

  const { mime } = await validateFileType(input.buffer)
  const inspected = await inspectImageBuffer(input.buffer, mime)
  const ext = extensionForMime(mime)
  const assetId = randomUUID()
  const { storageKey } = storeMediaOriginal(assetId, ext, input.buffer)
  const leaseExpiresAt = new Date(Date.now() + CONTENT_MEDIA_UPLOAD_LEASE_MS)

  const doc = await createMediaAssetRecord({
    _id: assetId,
    sessionId: input.sessionId,
    scopeKind: scope.kind,
    scopeKey: serializeMediaScope(scope),
    campaignId: 'campaignId' in scope ? scope.campaignId : undefined,
    userId: scope.kind === 'user-pc' ? scope.userId : undefined,
    createdByUserId: input.userId,
    storageKey,
    originalFilename: sanitizeFilename(input.originalFilename),
    mimeType: inspected.mimeType,
    byteSize: input.buffer.byteLength,
    orientedWidth: inspected.orientedWidth,
    orientedHeight: inspected.orientedHeight,
    contentHash,
    animated: inspected.animated,
    lifecycle: 'ready',
    referenceCount: 0,
    leaseExpiresAt,
  })

  if (input.idempotencyKey) {
    await recordMediaUploadIdempotency({
      sessionId: input.sessionId,
      idempotencyKey: input.idempotencyKey,
      contentHash,
      assetId: doc._id,
    })
  }

  return {
    sessionId: input.sessionId,
    asset: toMediaAsset(doc),
  }
}

export async function getMediaAssetMetadata(assetId: string, userId: string): Promise<MediaAsset> {
  return loadAuthorizedAsset(assetId, userId)
}

export async function getMediaAssetRendition(input: {
  assetId: string
  preset: MediaRenditionPreset
  crop?: NormalizedCrop
  userId: string
}): Promise<{ buffer: Buffer; mimeType: string }> {
  const doc = await findMediaAssetById(input.assetId)
  if (!doc) {
    throw new HttpError(404, 'not_found', 'Media asset not found.')
  }

  if (doc.lifecycle !== 'ready') {
    throw HttpError.badRequest('Media asset is not available.')
  }

  const scope = scopeFromDoc(doc)
  await assertMediaScopeAuthorized(scope, input.userId, 'read')

  const rendition = await generateMediaRendition({
    asset: doc,
    preset: input.preset,
    crop: input.crop,
  })

  return { buffer: rendition.buffer, mimeType: rendition.mimeType }
}

function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? 'upload'
  const trimmed = base.trim()
  return trimmed.length > 0 ? trimmed.slice(0, 255) : 'upload'
}
