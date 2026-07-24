import type { ApiContentTypeKey } from '@rpg/contracts'
import { CONTENT_DUPLICATION_IDEMPOTENCY_HEADER } from '@rpg/contracts'

import { HttpError } from '../../../../lib/http-error'
import { ContentDuplicationIdempotencyModel } from './content-duplication-idempotency.model'

export { CONTENT_DUPLICATION_IDEMPOTENCY_HEADER }

type StoredIdempotencyRow = {
  contentType: string
  sourceEntityId: string
  createdEntityId: string
}

export async function findDuplicateIdempotencyRecord(
  campaignId: string,
  idempotencyKey: string,
): Promise<StoredIdempotencyRow | null> {
  const doc = await ContentDuplicationIdempotencyModel.findOne({
    campaignId,
    idempotencyKey,
  })
    .select('contentType sourceEntityId createdEntityId')
    .lean<StoredIdempotencyRow | null>()

  return doc
}

export function assertIdempotencyRequestMatches(
  stored: StoredIdempotencyRow,
  contentType: ApiContentTypeKey,
  sourceEntityId: string,
): void {
  if (stored.contentType !== contentType || stored.sourceEntityId !== sourceEntityId) {
    throw HttpError.conflict('Idempotency key was already used for a different duplicate request.')
  }
}

export async function recordDuplicateIdempotency(args: {
  campaignId: string
  idempotencyKey: string
  contentType: ApiContentTypeKey
  sourceEntityId: string
  createdEntityId: string
}): Promise<void> {
  try {
    await ContentDuplicationIdempotencyModel.create(args)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return
    }
    throw error
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
