import { VOCABULARY_USAGE_SUMMARY_LIMIT } from '@rpg/contracts'

import { buildVocabularyEntryUsageFromBlockers } from './map-vocabulary-usage-references'

export type VocabularyBatchUsageEntryResult = {
  count: number
  summaryReferences: ReturnType<typeof buildVocabularyEntryUsageFromBlockers>['references']
}

export function buildVocabularyBatchUsageEntryResult(
  blockers: Parameters<typeof buildVocabularyEntryUsageFromBlockers>[0],
): VocabularyBatchUsageEntryResult {
  const { references, usedBy } = buildVocabularyEntryUsageFromBlockers(blockers)

  return {
    count: usedBy,
    summaryReferences: references.slice(0, VOCABULARY_USAGE_SUMMARY_LIMIT),
  }
}

export function buildVocabularyBatchUsageResults(
  entryIds: readonly string[],
  blockersByEntryId: Map<string, Parameters<typeof buildVocabularyEntryUsageFromBlockers>[0]>,
): Map<string, VocabularyBatchUsageEntryResult> {
  return new Map(
    entryIds.map((entryId) => [
      entryId,
      buildVocabularyBatchUsageEntryResult(blockersByEntryId.get(entryId) ?? []),
    ]),
  )
}
