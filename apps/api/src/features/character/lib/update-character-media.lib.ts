import type { ContentMedia, CharacterMediaPatchInput, MediaScope } from '@rpg/contracts'
import { getContentMediaPolicy } from '@rpg/contracts'
import { isValidObjectId } from 'mongoose'

import { HttpError } from '../../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../../lib/mongo-transaction'
import {
  prepareContentMediaReconciliation,
  reconcileReferencesWithSession,
  type ReconcileContentMediaResult,
} from '../../media/lib/reconcile-content-media'
import { serializeMediaScope } from '../../media/lib/scope.lib'
import { CharacterModel } from '../character.model'

export type UpdateCharacterMediaResult =
  | { ok: true; media: ContentMedia }
  | { ok: false; reason: 'not_found' }
  | Extract<ReconcileContentMediaResult, { ok: false }>
  | { ok: false; reason: 'stale_revision' }

function buildMediaRevisionFilter(characterId: string, expectedRevision: number) {
  if (expectedRevision === 0) {
    return {
      _id: characterId,
      $or: [
        { media: { $exists: false } },
        { media: null },
        { 'media.revision': { $exists: false } },
        { 'media.revision': 0 },
      ],
    }
  }

  return { _id: characterId, 'media.revision': expectedRevision }
}

type CharacterMediaDoc = {
  media?: ContentMedia
}

/** Atomically reconcile media references and persist character media with revision guard. */
export async function updateCharacterMediaRecord(input: {
  characterId: string
  scope: MediaScope
  patch: CharacterMediaPatchInput
  additionalAssetScopeKeys?: readonly string[]
}): Promise<UpdateCharacterMediaResult> {
  const { characterId, scope, patch } = input
  if (!isValidObjectId(characterId)) {
    return { ok: false, reason: 'not_found' }
  }

  if (!areMongoTransactionsEnabled()) {
    throw new HttpError(
      503,
      'transactions_unavailable',
      'Character media updates require MongoDB transactions.',
    )
  }

  const scopeKey = serializeMediaScope(scope)
  const subject = { kind: 'character' as const, id: characterId, scopeKey }
  const policy = getContentMediaPolicy('character')

  return runInTransaction(async (session) => {
    const doc = await CharacterModel.findById(characterId)
      .select('media')
      .session(session)
      .lean<CharacterMediaDoc | null>()

    if (!doc) {
      return { ok: false, reason: 'not_found' as const }
    }

    const currentMedia = doc.media ?? null
    const prepared = await prepareContentMediaReconciliation({
      subject,
      scope,
      currentMedia,
      proposedMedia: patch.media,
      expectedMediaRevision: patch.expectedMediaRevision,
      policy,
      additionalAssetScopeKeys: input.additionalAssetScopeKeys,
    })

    if (!prepared.ok) {
      return prepared
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

    const filter = buildMediaRevisionFilter(characterId, patch.expectedMediaRevision)
    const updateResult = await CharacterModel.updateOne(
      filter,
      { $set: { media: prepared.reconciledMedia } },
      { session },
    )

    if (updateResult.matchedCount === 0) {
      return {
        ok: false,
        reason: 'stale_revision' as const,
        media: currentMedia ?? undefined,
      }
    }

    return { ok: true, media: prepared.reconciledMedia }
  })
}
