import type { ContentUsageBlocker } from '@rpg/contracts'

export type ContentUsageReferrerIdentity =
  | { kind: 'content'; contentTypeKey: string; id: string }
  | { kind: 'character'; id: string }

/** Stable dedupe key for content usage referrers — resolvers must not invent ad-hoc keys. */
export function contentUsageReferrerIdentityKey(referrer: ContentUsageReferrerIdentity): string {
  if (referrer.kind === 'content') {
    return `content:${referrer.contentTypeKey}:${referrer.id}`
  }

  return `character:${referrer.id}`
}

export function contentUsageReferrerIdentityFromBlocker(
  blocker: ContentUsageBlocker,
): ContentUsageReferrerIdentity {
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

  throw new Error(`Unsupported content usage referrer blocker kind: ${blocker.kind}`)
}

export function contentUsageReferrerIdentityKeyFromBlocker(blocker: ContentUsageBlocker): string {
  return contentUsageReferrerIdentityKey(contentUsageReferrerIdentityFromBlocker(blocker))
}
