import {
  getRegisteredSourceDocument,
  sourceExcerptRevisionSchema,
  type SourceDocumentId,
  type SourceExcerptRevision,
} from '@rpg/contracts'

import { excerptLockKey, fingerprintSourceExcerpt } from './fingerprint-source-excerpt'

export class SourceExcerptStoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SourceExcerptStoreError'
  }
}

export function assertStoreTextPermitted(storeText: boolean): void {
  if (!storeText) {
    throw new SourceExcerptStoreError('Reference-only documents cannot store excerpt text.')
  }
}

export async function assertExcerptLock(
  revisions: readonly SourceExcerptRevision[],
  lock: Readonly<Record<string, string>>,
): Promise<void> {
  const seen = new Set<string>()
  const byExcerpt = new Map<string, SourceExcerptRevision[]>()

  for (const revision of revisions) {
    const key = excerptLockKey(revision.excerptId, revision.revision)
    if (seen.has(key)) {
      throw new SourceExcerptStoreError(`Duplicate excerpt revision ${key}.`)
    }
    seen.add(key)
    const group = byExcerpt.get(revision.excerptId) ?? []
    group.push(revision)
    byExcerpt.set(revision.excerptId, group)

    const locked = lock[key]
    if (!locked) throw new SourceExcerptStoreError(`Unlocked excerpt revision ${key}.`)
    const fingerprint = await fingerprintSourceExcerpt(revision)
    if (locked !== fingerprint) {
      throw new SourceExcerptStoreError(`Excerpt revision ${key} does not match its lock.`)
    }
  }

  for (const key of Object.keys(lock)) {
    if (!seen.has(key)) throw new SourceExcerptStoreError(`Lock entry ${key} has no revision.`)
  }

  for (const [excerptId, group] of byExcerpt) {
    const ordered = [...group].sort((a, b) => a.revision - b.revision)
    ordered.forEach((revision, index) => {
      const expected = index + 1
      if (revision.revision !== expected) {
        throw new SourceExcerptStoreError(
          `Excerpt ${excerptId} revisions must be contiguous starting at 1.`,
        )
      }
      if (expected === 1) {
        if (revision.supersedes) {
          throw new SourceExcerptStoreError(`Excerpt ${excerptId} revision 1 cannot supersede.`)
        }
        return
      }
      if (revision.supersedes?.revision !== expected - 1) {
        throw new SourceExcerptStoreError(
          `Excerpt ${excerptId} revision ${expected} must supersede revision ${expected - 1}.`,
        )
      }
      if (!ordered.some((candidate) => candidate.revision === expected - 1)) {
        throw new SourceExcerptStoreError(
          `Excerpt ${excerptId} is missing revision ${expected - 1}.`,
        )
      }
    })
  }
}

export async function parseExcerptStore(args: {
  documentId: SourceDocumentId
  contentTypeKey: string
  revisions: unknown
  lock: Readonly<Record<string, string>>
}): Promise<SourceExcerptRevision[]> {
  if (!Array.isArray(args.revisions)) {
    throw new SourceExcerptStoreError('Excerpt store must be an array of revisions.')
  }
  const document = getRegisteredSourceDocument(args.documentId)
  assertStoreTextPermitted(document.access.storeText)

  const parsed = args.revisions.map((revision) => sourceExcerptRevisionSchema.parse(revision))
  for (const revision of parsed) {
    if (revision.documentId !== args.documentId) {
      throw new SourceExcerptStoreError(
        `Excerpt ${revision.excerptId} is stored under ${args.documentId} but cites ${revision.documentId}.`,
      )
    }
    if (!revision.excerptId.startsWith(`${args.contentTypeKey}/`)) {
      throw new SourceExcerptStoreError(
        `Excerpt ${revision.excerptId} does not match content type ${args.contentTypeKey}.`,
      )
    }
  }
  await assertExcerptLock(parsed, args.lock)
  return parsed
}
