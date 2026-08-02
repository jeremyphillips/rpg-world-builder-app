import type { ContentUsageBlocker } from '@rpg/contracts'

import {
  vocabularyReferrerIdentityKeyFromBlocker,
  type VocabularyReferrerIdentity,
} from './referrer-identity'

type IndexBucket = Map<string, ContentUsageBlocker>

function bucketForVocabId(index: Map<string, IndexBucket>, vocabId: string): IndexBucket {
  const existing = index.get(vocabId)
  if (existing) return existing

  const bucket: IndexBucket = new Map()
  index.set(vocabId, bucket)
  return bucket
}

/** Pure inverted index — dedupes referrers by {@link vocabularyReferrerIdentityKey}. */
export function indexRecordsByVocabId<T>(
  records: readonly T[],
  extractIds: (record: T) => readonly string[],
  toBlocker: (record: T) => ContentUsageBlocker,
): Map<string, ContentUsageBlocker[]> {
  const index = new Map<string, IndexBucket>()

  for (const record of records) {
    const blocker = toBlocker(record)
    const identityKey = vocabularyReferrerIdentityKeyFromBlocker(blocker)

    for (const vocabId of extractIds(record)) {
      const bucket = bucketForVocabId(index, vocabId)
      if (!bucket.has(identityKey)) {
        bucket.set(identityKey, blocker)
      }
    }
  }

  return new Map([...index.entries()].map(([vocabId, bucket]) => [vocabId, [...bucket.values()]]))
}

/** Merges multiple indexes, deduping referrers by identity key per vocab id. */
export function mergeBlockerIndexes(
  indexes: readonly Map<string, ContentUsageBlocker[]>[],
): Map<string, ContentUsageBlocker[]> {
  const merged = new Map<string, IndexBucket>()

  for (const index of indexes) {
    for (const [vocabId, blockers] of index) {
      const bucket = bucketForVocabId(merged, vocabId)
      for (const blocker of blockers) {
        const identityKey = vocabularyReferrerIdentityKeyFromBlocker(blocker)
        if (!bucket.has(identityKey)) {
          bucket.set(identityKey, blocker)
        }
      }
    }
  }

  return new Map([...merged.entries()].map(([vocabId, bucket]) => [vocabId, [...bucket.values()]]))
}

export function blockersForVocabEntry(
  index: Map<string, ContentUsageBlocker[]>,
  entryId: string,
): ContentUsageBlocker[] {
  return index.get(entryId) ?? []
}

export type { VocabularyReferrerIdentity }
