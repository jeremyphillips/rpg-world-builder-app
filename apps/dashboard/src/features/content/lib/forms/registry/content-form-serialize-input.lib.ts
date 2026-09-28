import {
  contentMediaSchema,
  emptyContentMediaSchema,
  type ContentMedia,
  type ContentValidationIntent,
} from '@rpg/contracts'
import type { FieldValues } from 'react-hook-form'

import { hasDirtyFields } from '@/lib/form-dirty-state'

import type { AnyContentFormDef, ContentFormInputCtx } from './content-form-registry'

export type ContentFormSerializeOperation = 'create' | 'update'

export type SerializeContentFormInputOptions = {
  operation: ContentFormSerializeOperation
  dirtyFields?: Record<string, unknown>
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

/** True when form media is more than the blank create default (gallery or role assignments). */
export function hasAuthoredContentMedia(media: ContentMedia | undefined | null): boolean {
  if (!media) return false
  if (media.images.length > 0) return true
  return Object.keys(media.roles).length > 0
}

function shouldIncludeMediaInWritePayload(
  operation: ContentFormSerializeOperation,
  values: FieldValues,
  dirtyFields: Record<string, unknown> | undefined,
): boolean {
  if (operation === 'update') {
    return isManagedContentMediaDirty(dirtyFields)
  }
  return hasAuthoredContentMedia(values.media as ContentMedia | undefined)
}

function parseFormMedia(values: FieldValues): ContentMedia {
  return contentMediaSchema.parse(values.media ?? emptyContentMediaSchema)
}

/**
 * Maps validated form values to the content write API payload, merging managed
 * `media` when create/update rules say it belongs on the wire.
 */
export function serializeContentFormInput<
  TInput extends Record<string, unknown> = Record<string, unknown>,
>(
  def: Pick<AnyContentFormDef, 'supportsManagedMedia' | 'toInput'>,
  values: FieldValues,
  ctx: ContentFormInputCtx<unknown> | undefined,
  validationIntent: ContentValidationIntent,
  options: SerializeContentFormInputOptions,
): TInput {
  const baseInput = def.toInput(values, ctx, validationIntent) as TInput

  if (!def.supportsManagedMedia) {
    return baseInput
  }

  if (!shouldIncludeMediaInWritePayload(options.operation, values, options.dirtyFields)) {
    return baseInput
  }

  return {
    ...baseInput,
    media: parseFormMedia(values),
  } as TInput
}
