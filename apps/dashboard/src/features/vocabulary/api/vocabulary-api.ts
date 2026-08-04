import {
  vocabularyDisableAvailabilityBatchResponseSchema,
  type CreateVocabularyCampaignEntryInput,
  type ResolvedVocabularyOptionSet,
  type UpdateVocabularyEntryInput,
  type VocabularyDeleteAvailability,
  type VocabularyDisableAvailability,
  type VocabularyDisableAvailabilityBatchResponse,
  type VocabularyEntryUsage,
  type VocabularyOptionSetId,
} from '@rpg/contracts'

import { postActionBatchValidate } from '@/lib/actions/action-validate-batch'
import { deleteJson, patchJson, postJson, request } from '@/lib/api-client'

function vocabularySetPath(campaignId: string, setId: VocabularyOptionSetId) {
  return `/api/campaigns/${campaignId}/vocabulary/${setId}`
}

/** Load all resolved vocabulary sets for a campaign. */
export async function listVocabularySets(
  campaignId: string,
): Promise<ResolvedVocabularyOptionSet[]> {
  const { sets } = await request<{ sets: ResolvedVocabularyOptionSet[] }>(
    `/api/campaigns/${campaignId}/vocabulary`,
    undefined,
    'Could not load vocabulary sets.',
  )
  return sets
}

/** Load one resolved vocabulary set for a campaign. */
export async function getVocabularySet(
  campaignId: string,
  setId: VocabularyOptionSetId,
): Promise<ResolvedVocabularyOptionSet> {
  const { set } = await request<{ set: ResolvedVocabularyOptionSet }>(
    vocabularySetPath(campaignId, setId),
    undefined,
    'Could not load vocabulary set.',
  )
  return set
}

/** Advisory preflight for disabling a vocabulary entry. */
export async function fetchVocabularyDisableAvailability(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyDisableAvailability> {
  const { availability } = await request<{ availability: VocabularyDisableAvailability }>(
    `${vocabularySetPath(campaignId, setId)}/entries/${entryId}/disable-availability`,
    undefined,
    'Could not check vocabulary disable availability.',
  )
  return availability
}

/** Batch advisory preflight for disabling vocabulary entries. */
export async function fetchVocabularyDisableAvailabilityBatch(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryIds: readonly string[],
): Promise<VocabularyDisableAvailabilityBatchResponse> {
  const body = await postActionBatchValidate<{ targets: unknown }>({
    path: `${vocabularySetPath(campaignId, setId)}/entries/disable-availability/batch`,
    body: { targets: entryIds.map((entryId) => ({ entryId })) },
    fallbackMessage: 'Could not check vocabulary disable availability.',
  })

  return vocabularyDisableAvailabilityBatchResponseSchema.parse(body)
}

/** Advisory preflight for deleting a vocabulary entry. */
export async function fetchVocabularyDeleteAvailability(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyDeleteAvailability> {
  const { availability } = await request<{ availability: VocabularyDeleteAvailability }>(
    `${vocabularySetPath(campaignId, setId)}/entries/${entryId}/delete-availability`,
    undefined,
    'Could not check vocabulary delete availability.',
  )
  return availability
}

/** Informational usage references for a vocabulary entry. */
export async function fetchVocabularyEntryUsage(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyEntryUsage> {
  const { usage } = await request<{ usage: VocabularyEntryUsage }>(
    `${vocabularySetPath(campaignId, setId)}/entries/${entryId}/usage`,
    undefined,
    'Could not load vocabulary entry usage.',
  )
  return usage
}

/** Create a campaign vocabulary entry. */
export async function createVocabularyEntry(
  campaignId: string,
  input: CreateVocabularyCampaignEntryInput,
): Promise<ResolvedVocabularyOptionSet> {
  const { setId, ...body } = input
  const { set } = await postJson<{ set: ResolvedVocabularyOptionSet }>(
    `${vocabularySetPath(campaignId, setId)}/entries`,
    body,
    'Could not create vocabulary entry.',
  )
  return set
}

/** Patch a system or campaign vocabulary entry. */
export async function updateVocabularyEntry(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
  input: UpdateVocabularyEntryInput,
): Promise<ResolvedVocabularyOptionSet> {
  const { set } = await patchJson<{ set: ResolvedVocabularyOptionSet }>(
    `${vocabularySetPath(campaignId, setId)}/entries/${entryId}`,
    input,
    'Could not update vocabulary entry.',
  )
  return set
}

/** Delete a campaign-created vocabulary entry. */
export async function removeVocabularyEntry(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<ResolvedVocabularyOptionSet> {
  const { set } = await deleteJson<{ set: ResolvedVocabularyOptionSet }>(
    `${vocabularySetPath(campaignId, setId)}/entries/${entryId}`,
    'Could not delete vocabulary entry.',
  )
  return set
}
