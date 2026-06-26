import type {
  CreateVocabularyCampaignEntryInput,
  ResolvedVocabularyOptionSet,
  UpdateVocabularyEntryInput,
  VocabularyOptionSetId,
} from '@rpg/contracts'

import { deleteJson, patchJson, postJson, request } from '@/lib/api-client'

function vocabularySetPath(campaignId: string, setId: VocabularyOptionSetId) {
  return `/api/campaigns/${campaignId}/vocabulary/${setId}`
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

/** Create a campaign vocabulary entry. */
export async function createVocabularyEntry(
  campaignId: string,
  input: CreateVocabularyCampaignEntryInput,
): Promise<ResolvedVocabularyOptionSet> {
  const { set } = await postJson<{ set: ResolvedVocabularyOptionSet }>(
    `${vocabularySetPath(campaignId, input.setId)}/entries`,
    input,
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
