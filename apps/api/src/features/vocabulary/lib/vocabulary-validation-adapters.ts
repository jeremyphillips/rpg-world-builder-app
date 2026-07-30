import type { VocabularyOptionSetId } from '@rpg/contracts'

export type VocabularyValidationAdapter = (
  campaignId: string,
  setId: VocabularyOptionSetId,
  ids: readonly string[],
) => Promise<void>

/** Partial registry — optional set-specific validation beyond active-id membership. */
export const VOCABULARY_VALIDATION_ADAPTERS: Partial<
  Record<VocabularyOptionSetId, VocabularyValidationAdapter>
> = {}

export async function runVocabularyValidationAdapter(
  campaignId: string,
  setId: VocabularyOptionSetId,
  ids: readonly string[],
): Promise<void> {
  await VOCABULARY_VALIDATION_ADAPTERS[setId]?.(campaignId, setId, ids)
}
