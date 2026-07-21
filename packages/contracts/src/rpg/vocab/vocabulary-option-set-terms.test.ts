import { describe, expect, it } from 'vitest'

import { getVocabularyTermLabel } from './types'
import {
  getVocabularyOptionSetTerm,
  VOCABULARY_OPTION_SET_TERMS,
  VOCABULARY_OPTION_SET_TERM_IDS,
} from './vocabulary-option-set-terms'
import { VOCABULARY_OPTION_SET_IDS } from './vocabulary'

describe('vocabulary option set terms', () => {
  it('maps every option set id to a non-empty taxonomy term', () => {
    expect(Object.keys(VOCABULARY_OPTION_SET_TERMS).sort()).toEqual(
      [...VOCABULARY_OPTION_SET_IDS].sort(),
    )
    expect(VOCABULARY_OPTION_SET_TERM_IDS).toEqual(VOCABULARY_OPTION_SET_IDS)

    for (const setId of VOCABULARY_OPTION_SET_IDS) {
      const term = getVocabularyOptionSetTerm(setId)
      expect(getVocabularyTermLabel(term)).not.toBe('')
      expect(term.description).not.toBe('')
    }
  })

  it('resolves creature types through the registry', () => {
    expect(getVocabularyOptionSetTerm('creature-types').label).toBe('Creature Type')
  })
})
