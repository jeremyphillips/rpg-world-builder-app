import {
  reconcileContentProvenance,
  type ApiContentTypeKey,
  type ProvenanceEntryHostPath,
  type SourceDocumentId,
  type SourceExcerptRevision,
  type SystemRulesetId,
} from '@rpg/contracts'

import { buildExcerptRevisions, type CaptureSourceExcerptInput } from './build-excerpt-revisions'
import { excerptLockKey, fingerprintSourceExcerpt } from './fingerprint-source-excerpt'

export type CaptureRecordAttachment = {
  recordId: string
  citation?: { section?: string; page?: number }
  entries: readonly {
    host: ProvenanceEntryHostPath
    entryId: string
    excerptId: string
  }[]
}

export type CaptureSeedAttachment = {
  contentTypeKey: ApiContentTypeKey
  rulesetId: SystemRulesetId
  records: readonly CaptureRecordAttachment[]
}

export async function captureSourceExcerpts(input: CaptureSourceExcerptInput): Promise<{
  contentTypeKey: string
  revisions: SourceExcerptRevision[]
  lock: Record<string, string>
}> {
  const revisions = buildExcerptRevisions(input)
  const contentTypeKey = revisions[0]?.excerptId.split('/')[0]
  if (!contentTypeKey) throw new Error('Capture input has no excerpts.')
  if (revisions.some((revision) => !revision.excerptId.startsWith(`${contentTypeKey}/`))) {
    throw new Error('Capture input mixes excerpt content types.')
  }

  const lockEntries = await Promise.all(
    revisions.map(async (revision) => {
      const fingerprint = await fingerprintSourceExcerpt(revision)
      return [excerptLockKey(revision.excerptId, revision.revision), fingerprint] as const
    }),
  )
  const lock = Object.fromEntries(lockEntries.sort(([left], [right]) => left.localeCompare(right)))
  return { contentTypeKey, revisions, lock }
}

function excerptExists(
  revisions: readonly SourceExcerptRevision[],
  ref: { documentId: string; excerptId: string },
): boolean {
  return revisions.some(
    (revision) => revision.documentId === ref.documentId && revision.excerptId === ref.excerptId,
  )
}

/**
 * Writes record citations and entry excerpt references onto existing seed records.
 * Does not change mechanics. Initialize mode checks document membership and that
 * each excerpt was captured.
 */
export function applyCapturedProvenance<T extends { id: string; rulesetId: SystemRulesetId }>(
  records: readonly T[],
  args: {
    documentId: SourceDocumentId
    attachment: CaptureSeedAttachment
    revisions: readonly SourceExcerptRevision[]
  },
): T[] {
  const attachments = new Map(args.attachment.records.map((record) => [record.recordId, record]))
  return records.map((record) => {
    const attachment = attachments.get(record.id)
    if (!attachment) return record

    const next = { ...record } as T & Record<string, unknown>
    if (attachment.citation) {
      next.provenance = {
        citation: {
          documentId: args.documentId,
          locator: {
            ...(attachment.citation.section ? { section: attachment.citation.section } : {}),
            ...(attachment.citation.page ? { page: attachment.citation.page } : {}),
          },
        },
      }
    } else {
      delete next.provenance
    }

    for (const entryAttachment of attachment.entries) {
      const entries = next[entryAttachment.host]
      if (!Array.isArray(entries)) {
        throw new Error(
          `Record ${record.id} has no ${entryAttachment.host} array for excerpt ${entryAttachment.excerptId}.`,
        )
      }
      const index = entries.findIndex(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'id' in entry &&
          entry.id === entryAttachment.entryId,
      )
      if (index < 0) {
        throw new Error(
          `Record ${record.id} has no ${entryAttachment.host} entry ${entryAttachment.entryId}.`,
        )
      }
      const entry = entries[index]
      if (typeof entry !== 'object' || entry === null) {
        throw new Error(`Record ${record.id} entry ${entryAttachment.entryId} is not an object.`)
      }
      const updatedEntries = [...entries]
      updatedEntries[index] = {
        ...entry,
        provenance: {
          excerpt: { documentId: args.documentId, excerptId: entryAttachment.excerptId },
        },
      }
      next[entryAttachment.host] = updatedEntries
    }

    reconcileContentProvenance({
      authority: 'initialize',
      catalogLayer: 'system',
      rulesetId: record.rulesetId,
      contentTypeKey: args.attachment.contentTypeKey,
      normalized: next,
      excerptExists: (ref) => excerptExists(args.revisions, ref),
    })
    return next
  })
}
