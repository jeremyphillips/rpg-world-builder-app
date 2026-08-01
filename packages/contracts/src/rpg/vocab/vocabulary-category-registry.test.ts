import { describe, expect, it } from 'vitest'

import { VOCABULARY_OPTION_SET_IDS } from './vocabulary'
import {
  BROWSABLE_VOCABULARY_CATEGORIES,
  BROWSABLE_VOCABULARY_SET_ORDER,
  VOCABULARY_CATEGORIES,
  VOCABULARY_INTERNAL_ONLY_SET_IDS,
  findBrowsableVocabularyCategory,
  getVocabularyCategory,
  vocabularyCategoryHubLabel,
} from './vocabulary-category-registry'
import { getVocabularyOptionSetTerm } from './vocabulary-option-set-terms'
import { vocabularySetIdsWithBrowse } from './vocabulary-set-capabilities'

describe('vocabulary category registry', () => {
  it('lists every contract vocabulary set id', () => {
    expect(VOCABULARY_CATEGORIES.map((entry) => entry.setId)).toEqual([
      ...VOCABULARY_OPTION_SET_IDS,
    ])
  })

  it('orders browsable categories excluding internal-only sets', () => {
    expect(BROWSABLE_VOCABULARY_SET_ORDER).toEqual(
      VOCABULARY_OPTION_SET_IDS.filter(
        (setId) => !(VOCABULARY_INTERNAL_ONLY_SET_IDS as readonly string[]).includes(setId),
      ),
    )
    expect(BROWSABLE_VOCABULARY_CATEGORIES.map((entry) => entry.setId)).toEqual(
      BROWSABLE_VOCABULARY_SET_ORDER,
    )
  })

  it('marks internal-only sets as not browsable', () => {
    for (const setId of VOCABULARY_INTERNAL_ONLY_SET_IDS) {
      const category = getVocabularyCategory(setId)
      expect(category.internalOnly).toBe(true)
      expect(category.browse).toBe(false)
      expect(findBrowsableVocabularyCategory(setId)).toBeUndefined()
    }
  })

  it('derives hub labels from option-set taxonomy terms', () => {
    for (const entry of VOCABULARY_CATEGORIES) {
      expect(entry.label).toBe(vocabularyCategoryHubLabel(getVocabularyOptionSetTerm(entry.setId)))
      expect(entry.description).toBe(getVocabularyOptionSetTerm(entry.setId).description)
    }
  })

  it('aligns browse flags with capability matrix for public sets', () => {
    const browsableIds = vocabularySetIdsWithBrowse()
    expect(BROWSABLE_VOCABULARY_CATEGORIES.map((entry) => entry.setId)).toEqual(browsableIds)
  })
})
