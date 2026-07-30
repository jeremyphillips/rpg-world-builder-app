import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateVocabularyCampaignEntryInput,
  UpdateVocabularyEntryInput,
  VocabularyOptionSetId,
} from '@rpg/contracts'

import {
  createVocabularyEntry,
  getVocabularySet,
  removeVocabularyEntry,
  updateVocabularyEntry,
} from '../api/vocabulary-api'

export function vocabularySetQueryKey(campaignId: string, setId: VocabularyOptionSetId) {
  return ['campaigns', campaignId, 'vocabulary', setId] as const
}

/** Load a resolved vocabulary set with usage counts. */
export function useVocabularySet(
  campaignId: string | undefined,
  setId: VocabularyOptionSetId | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: campaignId && setId ? vocabularySetQueryKey(campaignId, setId) : [],
    queryFn: () => getVocabularySet(campaignId!, setId!),
    enabled: Boolean(campaignId && setId && enabled),
  })
}

export function useVocabularyMutations(campaignId: string, setId: VocabularyOptionSetId) {
  const queryClient = useQueryClient()
  const queryKey = vocabularySetQueryKey(campaignId, setId)

  function invalidateSet() {
    void queryClient.invalidateQueries({ queryKey })
  }

  const createEntry = useMutation({
    mutationFn: (input: CreateVocabularyCampaignEntryInput) =>
      createVocabularyEntry(campaignId, input),
    onSuccess: invalidateSet,
  })

  const patchEntry = useMutation({
    mutationFn: ({ entryId, input }: { entryId: string; input: UpdateVocabularyEntryInput }) =>
      updateVocabularyEntry(campaignId, setId, entryId, input),
    onSuccess: invalidateSet,
  })

  const deleteEntry = useMutation({
    mutationFn: (entryId: string) => removeVocabularyEntry(campaignId, setId, entryId),
    onSuccess: invalidateSet,
  })

  return { createEntry, patchEntry, deleteEntry, invalidateSet }
}
