import {
  catalogContentMediaExpectedRevisionField,
  collectContentMediaCoherenceIssues,
  contentTypeSubject,
  emptyContentMediaSchema,
  hasAuthoredContentMediaForCatalogWrite,
  prepareContentMediaForCatalogWrite,
  type CatalogContentMediaWriteContext,
  type ContentMedia,
  type ContentTypeKey,
  type ContentValidationIntent,
} from '@rpg/contracts'
import type { FieldValues } from 'react-hook-form'

import { hasDirtyFields } from '@/lib/form-dirty-state'

import type { AnyContentFormDef, ContentFormInputCtx } from './content-form-registry'

export type ContentFormSerializeOperation = 'create' | 'update'

export type SerializeContentFormInputOptions = {
  operation: ContentFormSerializeOperation
  dirtyFields?: Record<string, unknown>
  rulesetId?: string
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

/** @deprecated Use hasAuthoredContentMediaForCatalogWrite from @rpg/contracts at call sites with context. */
export function hasAuthoredContentMedia(
  media: ContentMedia | undefined | null,
  ctx?: CatalogContentMediaWriteContext,
): boolean {
  return hasAuthoredContentMediaForCatalogWrite(media, ctx)
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
  const contentSource =
    (ctx?.entity as { source?: 'homebrew' | 'system' } | undefined)?.source ?? 'homebrew'

  if (!slug) return undefined

  return {
    domain: def.mediaDomain,
    subject: contentTypeSubject(def.routeKey as ContentTypeKey),
    slug,
    contentSource,
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
 */
export function serializeContentFormInput<
  TInput extends Record<string, unknown> = Record<string, unknown>,
>(
  def: Pick<AnyContentFormDef, 'supportsManagedMedia' | 'mediaDomain' | 'routeKey' | 'toInput'>,
  values: FieldValues,
  ctx: ContentFormInputCtx<unknown> | undefined,
  validationIntent: ContentValidationIntent,
  options: SerializeContentFormInputOptions,
): TInput {
  const baseInput = def.toInput(values, ctx, validationIntent) as TInput

  if (!def.supportsManagedMedia) {
    return baseInput
  }

  const mediaCtx = resolveCatalogMediaWriteContext(def, values, ctx, options.rulesetId)

  if (!shouldIncludeMediaInWritePayload(options.operation, values, options.dirtyFields, mediaCtx)) {
    return baseInput
  }

  const prepared = prepareContentMediaForCatalogWrite(values.media ?? emptyContentMediaSchema)
  assertCoherentFormMedia(prepared)

  return {
    ...baseInput,
    media: prepared,
    [catalogContentMediaExpectedRevisionField]: prepared.revision,
  } as TInput
}
