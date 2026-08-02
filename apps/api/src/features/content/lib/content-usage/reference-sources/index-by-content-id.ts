import type { ContentUsageBlocker } from '@rpg/contracts'

import {
  contentUsageReferrerIdentityKeyFromBlocker,
  type ContentUsageReferrerIdentity,
} from './referrer-identity'

type IndexBucket = Map<string, ContentUsageBlocker>

function bucketForContentId(index: Map<string, IndexBucket>, contentId: string): IndexBucket {
  const existing = index.get(contentId)
  if (existing) return existing

  const bucket: IndexBucket = new Map()
  index.set(contentId, bucket)
  return bucket
}

/** Pure inverted index — dedupes referrers by {@link contentUsageReferrerIdentityKey}. */
export function indexRecordsByContentId<T>(
  records: readonly T[],
  extractIds: (record: T) => readonly string[],
  toBlocker: (record: T) => ContentUsageBlocker,
): Map<string, ContentUsageBlocker[]> {
  const index = new Map<string, IndexBucket>()

  for (const record of records) {
    const blocker = toBlocker(record)
    const identityKey = contentUsageReferrerIdentityKeyFromBlocker(blocker)

    for (const contentId of extractIds(record)) {
      const bucket = bucketForContentId(index, contentId)
      if (!bucket.has(identityKey)) {
        bucket.set(identityKey, blocker)
      }
    }
  }

  return new Map(
    [...index.entries()].map(([contentId, bucket]) => [contentId, [...bucket.values()]]),
  )
}

/** Merges multiple indexes, deduping referrers by identity key per content id. */
export function mergeBlockerIndexes(
  indexes: readonly Map<string, ContentUsageBlocker[]>[],
): Map<string, ContentUsageBlocker[]> {
  const merged = new Map<string, IndexBucket>()

  for (const index of indexes) {
    for (const [contentId, blockers] of index) {
      const bucket = bucketForContentId(merged, contentId)
      for (const blocker of blockers) {
        const identityKey = contentUsageReferrerIdentityKeyFromBlocker(blocker)
        if (!bucket.has(identityKey)) {
          bucket.set(identityKey, blocker)
        }
      }
    }
  }

  return new Map(
    [...merged.entries()].map(([contentId, bucket]) => [contentId, [...bucket.values()]]),
  )
}

export function blockersForContentEntry(
  index: Map<string, ContentUsageBlocker[]>,
  entryId: string,
): ContentUsageBlocker[] {
  return index.get(entryId) ?? []
}

export type { ContentUsageReferrerIdentity }
