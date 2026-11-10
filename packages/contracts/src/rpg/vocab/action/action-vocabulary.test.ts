import { describe, expect, it } from 'vitest'

import { ACTION_VOCABULARY_SEARCH_TERMS } from './action-vocabulary-search-terms'
import { getActionVocabularyEntry, getActionVocabularySearchTerms } from './action-vocabulary'

const MONSTER_MENU_VOCABULARY_IDS = Object.keys(ACTION_VOCABULARY_SEARCH_TERMS)

describe('action vocabulary search terms', () => {
  it('defines search terms for every monster menu preset vocabulary id', () => {
    for (const vocabularyId of MONSTER_MENU_VOCABULARY_IDS) {
      expect(ACTION_VOCABULARY_SEARCH_TERMS[vocabularyId]).toBeDefined()
      expect(getActionVocabularySearchTerms(vocabularyId).length).toBeGreaterThan(0)
    }
  })

  it('keeps search term lists unique', () => {
    for (const [id, terms] of Object.entries(ACTION_VOCABULARY_SEARCH_TERMS)) {
      expect(new Set(terms).size).toBe(terms.length)
      expect(getActionVocabularyEntry(id)?.label).toBeTruthy()
    }
  })

  it('locks intentional discovery queries', () => {
    expect(getActionVocabularySearchTerms('bite')).toEqual(
      expect.arrayContaining(['teeth', 'piercing']),
    )
    expect(getActionVocabularySearchTerms('constrict')).toEqual(expect.arrayContaining(['squeeze']))
  })
})
