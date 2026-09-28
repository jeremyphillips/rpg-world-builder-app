import {
  catalogContentMediaExpectedRevisionField,
  contentTypeSubject,
  emptyContentMediaSchema,
  getContentMediaPolicy,
  normalizeContentMediaForCatalogPersist,
  prepareContentMediaForCatalogWrite,
  resolveContentMediaDomainForContentType,
  resolvePersistedContentMediaOverride,
  serializeMediaScopeKey,
  validateContentMediaForCatalogWrite,
  type ApiContentTypeKey,
  type ContentMedia,
  type ContentSource,
  type SystemRulesetId,
} from '@rpg/contracts'
import type { ClientSession } from 'mongoose'

import { HttpError } from '../../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../../lib/mongo-transaction'
import { findMediaAssetsByIds } from '../../media/media.repository'
import {
  prepareContentMediaReconciliation,
  reconcileReferencesWithSession,
} from '../../media/lib/reconcile-content-media'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'

const CATALOG_MEDIA_TYPES = new Set<ApiContentTypeKey>([
  'classes',
  'species',
  'equipment',
  'locations',
  'organizations',
])

export function isCatalogMediaContentType(typeName: string): typeName is ApiContentTypeKey {
  return CATALOG_MEDIA_TYPES.has(typeName as ApiContentTypeKey)
}

export function normalizedPayloadIncludesMedia(normalized: Record<string, unknown>): boolean {
  return Object.prototype.hasOwnProperty.call(normalized, 'media')
}

export type CatalogMediaWriteEnvelope = {
  expectedMediaRevision?: number
  media: ContentMedia
}

export function extractCatalogMediaWriteEnvelope(
  normalized: Record<string, unknown>,
): CatalogMediaWriteEnvelope | undefined {
  if (!normalizedPayloadIncludesMedia(normalized)) return undefined

  const expectedMediaRevision = normalized[catalogContentMediaExpectedRevisionField]
  delete normalized[catalogContentMediaExpectedRevisionField]

  const prepared = prepareContentMediaForCatalogWrite(normalized.media)
  delete normalized.media

  return {
    ...(typeof expectedMediaRevision === 'number' ? { expectedMediaRevision } : {}),
    media: prepared,
  }
}

async function loadPersistedMediaOverride<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
  source: ContentSource,
): Promise<ContentMedia | null> {
  if (source === 'homebrew') {
    const doc = await config.homebrewModel
      .findOne({ _id: entityId, campaignId })
      .select({ media: 1 })
      .lean<{ media?: ContentMedia }>()
    return resolvePersistedContentMediaOverride({
      source,
      homebrewRecordMedia: doc?.media,
    })
  }

  if (!config.patchModel) return null
  const patchDoc = await config.patchModel
    .findOne({ campaignId, targetId: entityId })
    .lean<{ patch?: Record<string, unknown> }>()
  const patchMedia = patchDoc?.patch?.media
  return resolvePersistedContentMediaOverride({
    source,
    overlayPatchMedia:
      patchMedia !== undefined ? prepareContentMediaForCatalogWrite(patchMedia) : undefined,
  })
}

function buildCatalogMediaPersistContext<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  input: {
    slug: string
    contentSource: ContentSource
    rulesetId: SystemRulesetId
  },
) {
  const domain = resolveContentMediaDomainForContentType(config.typeName as ApiContentTypeKey)
  if (!domain) {
    throw new HttpError(500, 'internal_error', 'Catalog media domain is not configured.')
  }

  return {
    domain,
    subject: contentTypeSubject(config.typeName as ApiContentTypeKey),
    slug: input.slug,
    contentSource: input.contentSource,
    rulesetId: input.rulesetId,
  }
}

async function validateCatalogMediaForWrite(
  media: ContentMedia,
  domain: ReturnType<typeof resolveContentMediaDomainForContentType>,
): Promise<ContentMedia> {
  const policy = getContentMediaPolicy(domain!)
  const assetIds = [...new Set(media.images.map((image) => image.assetId))]
  const assets = await findMediaAssetsByIds(assetIds)
  const assetDimensionsById = Object.fromEntries(
    assets.map((asset) => [
      asset._id,
      { orientedWidth: asset.orientedWidth, orientedHeight: asset.orientedHeight },
    ]),
  )

  const validation = validateContentMediaForCatalogWrite(media, {
    policy,
    assetDimensionsById,
  })

  if (!validation.ok) {
    throw new HttpError(400, 'bad_request', 'Invalid content media.', validation.issues)
  }

  return validation.media
}

function buildContentMediaSubject(entityId: string, campaignId: string) {
  const scopeKey = serializeMediaScopeKey({ kind: 'campaign-content', campaignId })
  return {
    kind: 'content' as const,
    id: entityId,
    scopeKey,
  }
}

function throwReconcileFailure(prepared: {
  ok: false
  reason: string
  message?: string
  media?: ContentMedia
}): never {
  if (prepared.reason === 'stale_revision') {
    throw new HttpError(409, 'stale_revision', 'Content media revision is stale.', {
      media: prepared.media,
    })
  }
  if (prepared.reason === 'validation_failed') {
    throw new HttpError(400, 'bad_request', 'Invalid content media.')
  }
  throw new HttpError(400, 'bad_request', prepared.message ?? 'Media asset unavailable.')
}

async function reconcileCatalogContentMediaWithSession<T extends WriteEntityBase>(
  input: {
    config: ContentWriteConfig<T>
    campaignId: string
    entityId: string
    contentSource: ContentSource
    slug: string
    rulesetId: SystemRulesetId
    envelope: CatalogMediaWriteEnvelope
    mode: 'create' | 'update'
    currentMedia?: ContentMedia | null
  },
  session: ClientSession,
): Promise<ContentMedia> {
  const persistCtx = buildCatalogMediaPersistContext(input.config, {
    slug: input.slug,
    contentSource: input.contentSource,
    rulesetId: input.rulesetId,
  })

  const validated = await validateCatalogMediaForWrite(input.envelope.media, persistCtx.domain)
  const normalizedForPersist = normalizeContentMediaForCatalogPersist(validated, persistCtx)

  const currentMedia =
    input.currentMedia !== undefined
      ? input.currentMedia
      : input.mode === 'update'
        ? await loadPersistedMediaOverride(
            input.config,
            input.campaignId,
            input.entityId,
            input.contentSource,
          )
        : null

  const expectedMediaRevision = input.envelope.expectedMediaRevision ?? currentMedia?.revision ?? 0
  const scope = { kind: 'campaign-content' as const, campaignId: input.campaignId }
  const subject = buildContentMediaSubject(input.entityId, input.campaignId)
  const policy = getContentMediaPolicy(persistCtx.domain)

  const prepared = await prepareContentMediaReconciliation({
    subject,
    scope,
    currentMedia,
    proposedMedia: normalizedForPersist,
    expectedMediaRevision,
    policy,
  })

  if (!prepared.ok) {
    throwReconcileFailure(prepared)
  }

  await reconcileReferencesWithSession(
    {
      subject,
      previousAssetIds: prepared.previousAssetIds,
      nextAssetIds: prepared.nextAssetIds,
      proposedMedia: prepared.reconciledMedia,
    },
    session,
  )

  return prepared.reconciledMedia
}

/** Validates, normalizes, and reconciles catalog media; returns media ready to persist. */
export async function reconcileCatalogContentMediaForWrite<T extends WriteEntityBase>(
  input: Parameters<typeof reconcileCatalogContentMediaWithSession<T>>[0],
): Promise<ContentMedia> {
  if (!isCatalogMediaContentType(input.config.typeName)) {
    throw new HttpError(500, 'internal_error', 'Media reconciliation invoked for non-media type.')
  }

  if (!areMongoTransactionsEnabled()) {
    throw new HttpError(
      503,
      'transactions_unavailable',
      'Content media writes require MongoDB transactions.',
    )
  }

  return runInTransaction((session) => reconcileCatalogContentMediaWithSession(input, session))
}

export { reconcileCatalogContentMediaWithSession }

/** Detach upload references when homebrew catalog content is deleted. */
export async function releaseCatalogContentMediaReferences<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<void> {
  if (!isCatalogMediaContentType(config.typeName)) return

  const doc = await config.homebrewModel
    .findOne({ _id: entityId, campaignId })
    .lean<{ media?: ContentMedia; slug?: string; rulesetId?: SystemRulesetId }>()
  const currentMedia = doc?.media
  if (!currentMedia?.images.length) return

  await reconcileCatalogContentMediaForWrite({
    config,
    campaignId,
    entityId,
    contentSource: 'homebrew',
    slug: doc?.slug ?? '',
    rulesetId: doc?.rulesetId ?? 'srd-cc-5.2.1',
    envelope: { media: emptyContentMediaSchema, expectedMediaRevision: currentMedia.revision },
    mode: 'update',
    currentMedia,
  })
}
