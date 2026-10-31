import { canonicalJson, type SourceExcerptRevision } from '@rpg/contracts'

/** sha256 of the canonical full revision record. */
export async function fingerprintSourceExcerpt(revision: SourceExcerptRevision): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalJson(revision)),
  )
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function excerptLockKey(excerptId: string, revision: number): string {
  return `${excerptId}@${revision}`
}
