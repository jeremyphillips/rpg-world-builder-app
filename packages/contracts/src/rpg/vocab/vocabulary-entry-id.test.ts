import { describe, expect, it } from 'vitest'

import { deriveVocabularyEntryId } from './vocabulary-entry-id'

describe('deriveVocabularyEntryId', () => {
  it('derives a slug from a display label', () => {
    expect(deriveVocabularyEntryId('Fey Kin')).toBe('fey-kin')
  })

  it('falls back to untitled for empty labels', () => {
    expect(deriveVocabularyEntryId('   ')).toBe('untitled')
  })
})
