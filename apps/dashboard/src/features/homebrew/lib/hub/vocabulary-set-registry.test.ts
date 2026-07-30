import { describe, expect, it } from 'vitest'

import {
  VOCABULARY_OPTION_SET_IDS,
  getVocabularyOptionSetTerm,
  vocabularySetIdsWithOverview,
} from '@rpg/contracts'

import { vocabularyHubLabel } from '../vocabulary/term-labels'
import { ENABLED_VOCABULARY_SET_IDS, HOMEBREW_VOCABULARY_SETS } from './vocabulary-set-registry'

describe('vocabulary-set-registry', () => {
  it('lists every contract vocabulary set id with a label', () => {
    const registryIds = HOMEBREW_VOCABULARY_SETS.map((entry) => entry.setId)
    expect(registryIds).toEqual([...VOCABULARY_OPTION_SET_IDS])
  })

  it('derives hub labels from option-set taxonomy terms', () => {
    for (const entry of HOMEBREW_VOCABULARY_SETS) {
      expect(entry.label).toBe(vocabularyHubLabel(getVocabularyOptionSetTerm(entry.setId)))
    }
  })

  it('derives enabled sets from overview capabilities', () => {
    const enabled = HOMEBREW_VOCABULARY_SETS.filter((entry) => entry.enabled).map(
      (entry) => entry.setId,
    )
    expect(enabled).toEqual(vocabularySetIdsWithOverview())
    expect(ENABLED_VOCABULARY_SET_IDS).toEqual(enabled)
  })
})
