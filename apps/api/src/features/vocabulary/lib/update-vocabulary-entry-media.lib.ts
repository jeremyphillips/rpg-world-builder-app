import type {
  ContentMedia,
  MediaScope,
  SystemRulesetId,
  VocabularyOptionSetId,
  VocabularyOptionSetPatch,
} from '@rpg/contracts'
import { getContentMediaPolicy, serializeMediaScopeKey } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../../lib/mongo-transaction'
import {
  prepareContentMediaReconciliation,
  reconcileReferencesWithSession,
  type ReconcileContentMediaResult,
} from '../../media/lib/reconcile-content-media'
import { CampaignRulesetPatchModel } from './campaign-ruleset-patch.model'

export type UpdateVocabularyEntryMediaResult =
  | { ok: true; media: ContentMedia }
  | { ok: false; reason: 'not_found' }
  | Extract<ReconcileContentMediaResult, { ok: false }>
  | { ok: false; reason: 'stale_revision' }

function applyMediaToSetPatch(
  setPatch: VocabularyOptionSetPatch,
  entryId: string,
  source: 'system' | 'campaign',
  media: ContentMedia,
): VocabularyOptionSetPatch {
  if (source === 'system') {
    const patches = setPatch.systemEntryPatches ?? []
    const index = patches.findIndex((patch) => patch.id === entryId)
    const next = { ...(index >= 0 ? patches[index]! : { id: entryId }), media }
    const systemEntryPatches =
      index === -1 ? [...patches, next] : patches.map((patch, i) => (i === index ? next : patch))

    return { ...setPatch, systemEntryPatches }
  }

  const campaignEntries = setPatch.campaignEntries ?? []
  const index = campaignEntries.findIndex((entry) => entry.id === entryId)
  if (index === -1) {
    throw new HttpError(404, 'not_found', `Campaign vocabulary entry "${entryId}" not found.`)
  }
  return {
    ...setPatch,
    campaignEntries: campaignEntries.map((entry, i) => (i === index ? { ...entry, media } : entry)),
  }
}

function readEntryMedia(
  setPatch: VocabularyOptionSetPatch | undefined,
  entryId: string,
  source: 'system' | 'campaign',
): ContentMedia | null {
  if (!setPatch) return null
  if (source === 'system') {
    return setPatch.systemEntryPatches?.find((patch) => patch.id === entryId)?.media ?? null
  }
  return setPatch.campaignEntries?.find((entry) => entry.id === entryId)?.media ?? null
}

/** Atomically reconcile vocabulary entry media and persist on the ruleset patch. */
export async function updateVocabularyEntryMediaRecord(input: {
  campaignId: string
  rulesetId: SystemRulesetId
  setId: VocabularyOptionSetId
  entryId: string
  source: 'system' | 'campaign'
  scope: MediaScope
  currentMedia: ContentMedia | null
  patch: { media: ContentMedia; expectedMediaRevision: number }
}): Promise<UpdateVocabularyEntryMediaResult> {
  if (!areMongoTransactionsEnabled()) {
    throw new HttpError(
      503,
      'transactions_unavailable',
      'Vocabulary media updates require MongoDB transactions.',
    )
  }

  const scopeKey = serializeMediaScopeKey(input.scope)
  const subject = {
    kind: 'game-term' as const,
    id: `${input.campaignId}:${input.rulesetId}:${input.setId}:${input.entryId}`,
    scopeKey,
  }
  const policy = getContentMediaPolicy('game-term')

  return runInTransaction(async (session) => {
    const doc = await CampaignRulesetPatchModel.findOne({
      campaignId: input.campaignId,
      rulesetId: input.rulesetId,
    })
      .session(session)
      .lean<{ vocabulary?: VocabularyOptionSetPatch[] } | null>()

    const vocabulary = [...(doc?.vocabulary ?? [])]
    const setIndex = vocabulary.findIndex((entry) => entry.setId === input.setId)
    const setPatch = setIndex === -1 ? { setId: input.setId } : { ...vocabulary[setIndex]! }
    const persistedMedia = readEntryMedia(setPatch, input.entryId, input.source)
    const currentRevision = persistedMedia?.revision ?? 0

    if (input.patch.expectedMediaRevision !== currentRevision) {
      return {
        ok: false,
        reason: 'stale_revision' as const,
        media: persistedMedia ?? undefined,
      }
    }

    const prepared = await prepareContentMediaReconciliation({
      subject,
      scope: input.scope,
      currentMedia: input.currentMedia,
      proposedMedia: input.patch.media,
      expectedMediaRevision: input.patch.expectedMediaRevision,
      policy,
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

    const nextSetPatch = applyMediaToSetPatch(
      setPatch,
      input.entryId,
      input.source,
      prepared.reconciledMedia,
    )

    if (setIndex === -1) {
      vocabulary.push(nextSetPatch)
    } else {
      vocabulary[setIndex] = nextSetPatch
    }

    await CampaignRulesetPatchModel.updateOne(
      { campaignId: input.campaignId, rulesetId: input.rulesetId },
      { $set: { vocabulary } },
      { session, upsert: true },
    )

    return { ok: true, media: prepared.reconciledMedia }
  })
}
