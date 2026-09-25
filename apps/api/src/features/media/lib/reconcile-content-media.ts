import { randomUUID } from 'node:crypto'

import type { ContentMedia, ContentMediaPolicy, MediaSubject } from '@rpg/contracts'
import { validateContentMedia } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../../lib/mongo-transaction'
import { serializeMediaScope } from './scope.lib'
import {
  createMediaReferenceRecords,
  deleteMediaReferencesForSubject,
  findMediaAssetsByIds,
  findMediaReferencesForSubject,
  incrementMediaAssetReferenceCount,
} from '../media.repository'

export type ReconcileContentMediaInput = {
  subject: MediaSubject
  scope: Parameters<typeof serializeMediaScope>[0]
  currentMedia: ContentMedia | null
  proposedMedia: ContentMedia
  expectedMediaRevision?: number
  policy: ContentMediaPolicy
}

export type ReconcileContentMediaResult =
  | { ok: true; media: ContentMedia }
  | {
      ok: false
      reason: 'stale_revision' | 'validation_failed' | 'asset_unavailable'
      media?: ContentMedia
      message?: string
    }

function nextRevision(current: ContentMedia | null): number {
  return (current?.revision ?? 0) + 1
}

async function assertAssetsAttachable(input: {
  assetIds: readonly string[]
  scopeKey: string
}): Promise<
  | {
      ok: true
      assetDimensionsById: Record<string, { orientedWidth: number; orientedHeight: number }>
    }
  | { ok: false; message: string }
> {
  const assets = await findMediaAssetsByIds(input.assetIds)
  const assetById = new Map(assets.map((asset) => [asset._id, asset]))
  const assetDimensionsById: Record<string, { orientedWidth: number; orientedHeight: number }> = {}

  for (const assetId of input.assetIds) {
    const asset = assetById.get(assetId)
    if (!asset) {
      return { ok: false, message: `Media asset ${assetId} was not found.` }
    }
    if (asset.scopeKey !== input.scopeKey) {
      return { ok: false, message: `Media asset ${assetId} is outside the authorized scope.` }
    }
    if (asset.lifecycle !== 'ready') {
      return { ok: false, message: `Media asset ${assetId} is not available for attachment.` }
    }
    assetDimensionsById[assetId] = {
      orientedWidth: asset.orientedWidth,
      orientedHeight: asset.orientedHeight,
    }
  }

  return { ok: true, assetDimensionsById }
}

async function reconcileReferencesInTransaction(input: {
  subject: MediaSubject
  previousAssetIds: readonly string[]
  nextAssetIds: readonly string[]
  proposedMedia: ContentMedia
}): Promise<ContentMedia> {
  return runInTransaction(async (session) => {
    const previousSet = new Set(input.previousAssetIds)
    const nextSet = new Set(input.nextAssetIds)
    const removed = input.previousAssetIds.filter((assetId) => !nextSet.has(assetId))
    const added = input.nextAssetIds.filter((assetId) => !previousSet.has(assetId))

    await deleteMediaReferencesForSubject(input.subject, { session })

    await createMediaReferenceRecords(
      input.proposedMedia.images.map((image) => ({
        _id: randomUUID(),
        assetId: image.assetId,
        subjectKind: input.subject.kind,
        subjectId: input.subject.id,
        scopeKey: input.subject.scopeKey,
        attachmentId: image.id,
      })),
      { session },
    )

    await Promise.all([
      ...removed.map((assetId) => incrementMediaAssetReferenceCount(assetId, -1, { session })),
      ...added.map((assetId) => incrementMediaAssetReferenceCount(assetId, 1, { session })),
    ])

    return input.proposedMedia
  })
}

/** Validate, replace gallery references, and bump media revision atomically. */
export async function reconcileContentMedia(
  input: ReconcileContentMediaInput,
): Promise<ReconcileContentMediaResult> {
  const currentRevision = input.currentMedia?.revision ?? 0
  if (
    input.expectedMediaRevision !== undefined &&
    input.expectedMediaRevision !== currentRevision
  ) {
    return {
      ok: false,
      reason: 'stale_revision',
      media: input.currentMedia ?? undefined,
    }
  }

  const scopeKey = serializeMediaScope(input.scope)
  if (input.subject.scopeKey !== scopeKey) {
    throw HttpError.badRequest('Media subject scope does not match the authorized scope.')
  }

  const uniqueAssetIds = [...new Set(input.proposedMedia.images.map((image) => image.assetId))]
  const assetCheck = await assertAssetsAttachable({ assetIds: uniqueAssetIds, scopeKey })
  if (!assetCheck.ok) {
    return { ok: false, reason: 'asset_unavailable', message: assetCheck.message }
  }

  const validation = validateContentMedia(input.proposedMedia, {
    policy: input.policy,
    assetDimensionsById: assetCheck.assetDimensionsById,
  })
  if (!validation.ok) {
    return { ok: false, reason: 'validation_failed' }
  }

  const previousRefs = await findMediaReferencesForSubject(input.subject)
  const previousAssetIds = previousRefs.map((ref) => ref.assetId)
  const nextAssetIds = uniqueAssetIds

  const reconciledMedia: ContentMedia = {
    ...validation.media,
    revision: nextRevision(input.currentMedia),
  }

  if (!areMongoTransactionsEnabled()) {
    throw new HttpError(
      503,
      'transactions_unavailable',
      'Content media reconciliation requires MongoDB transactions.',
    )
  }

  await reconcileReferencesInTransaction({
    subject: input.subject,
    previousAssetIds,
    nextAssetIds,
    proposedMedia: reconciledMedia,
  })

  return { ok: true, media: reconciledMedia }
}
