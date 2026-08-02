import type { ContentUsageBlocker } from '@rpg/contracts'

export type VocabularyReferrerIdentity =
  | { kind: 'content'; contentTypeKey: string; id: string }
  | { kind: 'character'; id: string }

/** Stable dedupe key for vocabulary usage referrers — resolvers must not invent ad-hoc keys. */
export function vocabularyReferrerIdentityKey(referrer: VocabularyReferrerIdentity): string {
  if (referrer.kind === 'content') {
    return `content:${referrer.contentTypeKey}:${referrer.id}`
  }

  return `character:${referrer.id}`
}

export function vocabularyReferrerIdentityFromBlocker(
  blocker: ContentUsageBlocker,
): VocabularyReferrerIdentity {
  if (blocker.kind === 'content') {
    return {
      kind: 'content',
      contentTypeKey: blocker.contentTypeKey,
      id: blocker.id,
    }
  }

  if (blocker.kind === 'usage') {
    return {
      kind: 'character',
      id: blocker.usage.id,
    }
  }

  throw new Error(`Unsupported vocabulary referrer blocker kind: ${blocker.kind}`)
}

export function vocabularyReferrerIdentityKeyFromBlocker(blocker: ContentUsageBlocker): string {
  return vocabularyReferrerIdentityKey(vocabularyReferrerIdentityFromBlocker(blocker))
}
