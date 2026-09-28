import {
  canDuplicateContentType,
  CONTENT_TYPE_CAPABILITIES,
  type ApiContentTypeKey,
} from '@rpg/contracts'

import { HttpError } from '../../../../lib/http-error'
import { isContentWriteType } from '../../content-types'

/** Envelope, overlay, and operational fields that must never copy into create input. */
export const DUPLICATE_DENIED_FIELDS = [
  'id',
  'slug',
  'rulesetId',
  'source',
  'status',
  'campaignId',
  'createdAt',
  'updatedAt',
  'campaignAccess',
  '_id',
  '__v',
  'modeling',
] as const

export function assertDuplicateContentType(
  contentType: string,
): asserts contentType is ApiContentTypeKey {
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  if (!canDuplicateContentType(contentType)) {
    throw new HttpError(
      400,
      'not_duplicable',
      `Content type "${contentType}" cannot be duplicated.`,
    )
  }
}

export function omitDuplicateDeniedFields(body: Record<string, unknown>): Record<string, unknown> {
  const result = { ...body }
  for (const key of DUPLICATE_DENIED_FIELDS) {
    delete result[key]
  }
  return result
}

export function extractEntityBodyForDuplicate(
  entity: Record<string, unknown>,
): Record<string, unknown> {
  return omitDuplicateDeniedFields(entity)
}

export function resolveNestedIdRegeneration(contentType: ApiContentTypeKey) {
  return CONTENT_TYPE_CAPABILITIES[contentType].nestedIdRegeneration
}
