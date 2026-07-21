import {
  CONTENT_TYPE_KEYS,
  getContentTypeTerm,
  getVocabularyOptionSetTerm,
  VOCABULARY_OPTION_SET_IDS,
  type ContentTypeKey,
  type VocabularyOptionSetId,
} from '@rpg/contracts'

import type { TermAuditTarget } from './types'

export class TermAuditTargetError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TermAuditTargetError'
  }
}

function isContentTypeKey(value: string): value is ContentTypeKey {
  return (CONTENT_TYPE_KEYS as readonly string[]).includes(value)
}

function isVocabularyOptionSetId(value: string): value is VocabularyOptionSetId {
  return (VOCABULARY_OPTION_SET_IDS as readonly string[]).includes(value)
}

export function resolveContentTypeTarget(id: string): TermAuditTarget {
  if (!isContentTypeKey(id)) {
    throw new TermAuditTargetError(`Unknown content type: ${id}`)
  }

  return { kind: 'content_type', id, term: getContentTypeTerm(id) }
}

export function resolveVocabularySetTarget(id: string): TermAuditTarget {
  if (!isVocabularyOptionSetId(id)) {
    throw new TermAuditTargetError(`Unknown vocabulary set: ${id}`)
  }

  return { kind: 'vocabulary_set', id, term: getVocabularyOptionSetTerm(id) }
}

export function resolveTargetKind(
  id: string,
  matches: { contentType: boolean; vocabularySet: boolean },
): TermAuditTarget['kind'] {
  const { contentType: contentTypeMatch, vocabularySet: vocabularySetMatch } = matches
  if (contentTypeMatch && vocabularySetMatch) {
    throw new TermAuditTargetError(
      `Ambiguous term target: ${id}. Use --content-type ${id} or --vocab-set ${id}.`,
    )
  }

  if (contentTypeMatch) return 'content_type'
  if (vocabularySetMatch) return 'vocabulary_set'

  throw new TermAuditTargetError(
    `Unknown term target: ${id}. Use --content-type or --vocab-set to select a known registry.`,
  )
}

export function resolveTermTarget(id: string): TermAuditTarget {
  const kind = resolveTargetKind(id, {
    contentType: isContentTypeKey(id),
    vocabularySet: isVocabularyOptionSetId(id),
  })
  return kind === 'content_type' ? resolveContentTypeTarget(id) : resolveVocabularySetTarget(id)
}
