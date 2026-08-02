import { describe, expect, it } from 'vitest'

import {
  BROWSABLE_VOCABULARY_CATEGORIES,
  getVocabularyOptionSetTerm,
  vocabularyCategoryHubLabel,
  vocabularySetIdsWithBrowse,
} from '@rpg/contracts'

import { GAME_TERMS_VOCABULARY_CATEGORIES } from './vocabulary-set-registry'

describe('vocabulary-set-registry', () => {
  it('projects browsable categories from contract SSOT', () => {
    expect(GAME_TERMS_VOCABULARY_CATEGORIES).toEqual(BROWSABLE_VOCABULARY_CATEGORIES)
  })

  it('derives hub labels from option-set taxonomy terms', () => {
    for (const entry of GAME_TERMS_VOCABULARY_CATEGORIES) {
      expect(entry.label).toBe(vocabularyCategoryHubLabel(getVocabularyOptionSetTerm(entry.setId)))
      expect(entry.description).toBe(getVocabularyOptionSetTerm(entry.setId).description)
    }
  })

  it('derives browsable sets from capability matrix', () => {
    const browsableIds = GAME_TERMS_VOCABULARY_CATEGORIES.map((entry) => entry.setId)
    expect(browsableIds).toEqual(vocabularySetIdsWithBrowse())
  })
})
