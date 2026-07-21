import { describe, expect, it } from 'vitest'

import {
  resolveContentTypeTarget,
  resolveTermTarget,
  resolveTargetKind,
  resolveVocabularySetTarget,
  TermAuditTargetError,
} from './resolve-term-target'

describe('term audit target resolution', () => {
  it('resolves content-type and vocabulary-set targets', () => {
    expect(resolveTermTarget('species')).toMatchObject({
      kind: 'content_type',
      id: 'species',
      term: { label: 'Species' },
    })
    expect(resolveVocabularySetTarget('creature-types')).toMatchObject({
      kind: 'vocabulary_set',
      id: 'creature-types',
      term: { label: 'Creature Type' },
    })
  })

  it('rejects invalid namespace targets', () => {
    expect(() => resolveContentTypeTarget('creature-types')).toThrow(TermAuditTargetError)
    expect(() => resolveVocabularySetTarget('species')).toThrow(TermAuditTargetError)
    expect(() => resolveTermTarget('unknown')).toThrow(TermAuditTargetError)
  })

  it('requires an explicit namespace when registry ids overlap', () => {
    expect(() =>
      resolveTargetKind('shared-id', { contentType: true, vocabularySet: true }),
    ).toThrow('Ambiguous term target: shared-id')
  })
})
