import {
  catalogContentMediaExpectedRevisionField,
  collectContentMediaCoherenceIssues,
  contentTypeSubject,
  emptyContentMediaSchema,
  hasAuthoredContentMediaForCatalogWrite,
  prepareContentMediaForCatalogWrite,
  type CatalogContentMediaWriteContext,
  type CatalogLayer,
  type ContentMedia,
  type ContentTypeKey,
  type ContentValidationIntent,
} from '@rpg/contracts'
import type { FieldValues } from 'react-hook-form'

import { hasDirtyFields } from '@/lib/form-dirty-state'

import { buildSystemOverlayUpdatePayload } from './build-system-overlay-intent'
import type { AnyContentFormDef, ContentFormInputCtx } from './content-form-registry'
import {
  assertSystemOverlayWriteReady,
  assertSystemOverlayWriteSnapshotMatchesEntity,
} from './system-overlay-write-readiness.lib'

export type ContentFormSerializeOperation = 'create' | 'update'

export type SerializeContentFormInputOptions = {
  operation: ContentFormSerializeOperation
  dirtyFields?: Record<string, unknown>
  rulesetId?: string
  /** Normalized overlay baseline captured at edit load / post-save reset. */
  overlayBaseline?: Record<string, unknown>
  /** Catalog seed body for the system record (overlay diff authority). */
  catalogSeed?: Record<string, unknown>
  expectedOverlayRevision?: number
  entityId?: string
  seedRowIdsByPath?: Readonly<Record<string, readonly string[]>>
}

export function isManagedContentMediaDirty(
  dirtyFields: Record<string, unknown> | undefined,
): boolean {
  if (!dirtyFields) return false
  const mediaDirty = dirtyFields.media
  if (mediaDirty === true) return true
  if (mediaDirty && typeof mediaDirty === 'object') {
    return hasDirtyFields(mediaDirty as Record<string, unknown>)
  }
  return false
}

function resolveCatalogMediaWriteContext(
  def: Pick<AnyContentFormDef, 'routeKey' | 'mediaDomain'>,
  values: FieldValues,
  ctx: ContentFormInputCtx<unknown> | undefined,
  rulesetId?: string,
): CatalogContentMediaWriteContext | undefined {
  if (!def.mediaDomain) return undefined

  const slug =
    (ctx?.entity as { slug?: string } | undefined)?.slug ??
    (typeof values.slug === 'string' ? values.slug : undefined)
  const catalogLayer =
    (ctx?.entity as { catalogLayer?: CatalogLayer } | undefined)?.catalogLayer ?? 'homebrew'

  if (!slug) return undefined

  return {
    domain: def.mediaDomain,
    subject: contentTypeSubject(def.routeKey as ContentTypeKey),
    slug,
    catalogLayer,
    rulesetId,
  }
}

function shouldIncludeMediaInWritePayload(
  operation: ContentFormSerializeOperation,
  values: FieldValues,
  dirtyFields: Record<string, unknown> | undefined,
  mediaCtx: CatalogContentMediaWriteContext | undefined,
): boolean {
  const media = values.media as ContentMedia | undefined
  if (operation === 'update') {
    return isManagedContentMediaDirty(dirtyFields)
  }
  return hasAuthoredContentMediaForCatalogWrite(media, mediaCtx)
}

function assertCoherentFormMedia(prepared: ContentMedia): void {
  const issues = collectContentMediaCoherenceIssues(prepared)
  if (issues.length === 0) return
  const first = issues[0]!
  throw new Error(first.message)
}

/**
 * Maps validated form values to the content write API payload, merging managed
 * `media` when create/update rules say it belongs on the wire.
 *
 * Unresolved overlay targets never reach this function. `ContentEditShell` renders
 * a blocking alert and omits the form when list `overlayFailures` match the entity
 * id, so serialize does not take an `unresolvedOverlay` flag. Callers that still
 * hold that signal can pass it to `assertSystemOverlayWriteReady` directly.
 */
export function serializeContentFormInput<
  TInput extends Record<string, unknown> = Record<string, unknown>,
>(
  def: Pick<
    AnyContentFormDef,
    | 'supportsManagedMedia'
    | 'mediaDomain'
    | 'routeKey'
    | 'toInput'
    | 'normalizeOverlayBody'
    | 'overlayParticipantId'
  >,
  values: FieldValues,
  ctx: ContentFormInputCtx<unknown> | undefined,
  validationIntent: ContentValidationIntent,
  options: SerializeContentFormInputOptions,
): TInput {
  const entityRecord = ctx?.entity as
    | {
        catalogLayer?: CatalogLayer
        id?: string
        overlayRevision?: number
      }
    | undefined
  const catalogLayer = entityRecord?.catalogLayer
  const isSystemUpdate = options.operation === 'update' && catalogLayer === 'system'

  let payload: Record<string, unknown>

  if (isSystemUpdate) {
    const participantId = def.overlayParticipantId
    const snapshot = assertSystemOverlayWriteReady({
      operation: options.operation,
      catalogLayer,
      participantId,
      entityId: options.entityId,
      rulesetId: options.rulesetId,
      hasNormalizer: Boolean(def.normalizeOverlayBody),
      catalogSeed: options.catalogSeed,
      overlayBaseline: options.overlayBaseline,
      expectedOverlayRevision: options.expectedOverlayRevision,
      seedRowIdsByPath: options.seedRowIdsByPath,
    })
    assertSystemOverlayWriteSnapshotMatchesEntity({
      snapshotEntityId: snapshot.entityId,
      snapshotRevision: snapshot.expectedOverlayRevision,
      entityId: entityRecord?.id,
      entityRevision: entityRecord?.overlayRevision,
    })

    payload = {
      ...buildSystemOverlayUpdatePayload({
        participantId: snapshot.participantId,
        catalogSeed: snapshot.catalogSeed,
        baseline: snapshot.overlayBaseline,
        draft: def.normalizeOverlayBody!(values, ctx, validationIntent),
        validationIntent,
        expectedOverlayRevision: snapshot.expectedOverlayRevision,
      }),
    }
  } else {
    payload = { ...(def.toInput(values, ctx, validationIntent) as TInput) }
  }

  if (!def.supportsManagedMedia) {
    return payload as TInput
  }

  const mediaCtx = resolveCatalogMediaWriteContext(def, values, ctx, options.rulesetId)

  if (!shouldIncludeMediaInWritePayload(options.operation, values, options.dirtyFields, mediaCtx)) {
    return payload as TInput
  }

  const prepared = prepareContentMediaForCatalogWrite(values.media ?? emptyContentMediaSchema)
  assertCoherentFormMedia(prepared)

  return {
    ...payload,
    media: prepared,
    [catalogContentMediaExpectedRevisionField]: prepared.revision,
  } as unknown as TInput
}
