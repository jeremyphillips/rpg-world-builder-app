import { describe, expect, it } from 'vitest'

import { CREATURE_TRAIT_SEARCH_TERMS } from './trait-vocabulary-search-terms'
import {
  CREATURE_TRAIT_VOCABULARY_IDS,
  getCreatureTraitSearchTerms,
  getCreatureTraitVocabularyEntry,
} from './trait-vocabulary'

describe('creature trait vocabulary search terms', () => {
  it('defines search terms for every trait id', () => {
    expect(Object.keys(CREATURE_TRAIT_SEARCH_TERMS).sort()).toEqual(
      [...CREATURE_TRAIT_VOCABULARY_IDS].sort(),
    )
  })

  it('keeps search term lists unique and non-empty', () => {
    for (const id of CREATURE_TRAIT_VOCABULARY_IDS) {
      const terms = getCreatureTraitSearchTerms(id)
      expect(terms.length).toBeGreaterThan(0)
      expect(new Set(terms).size).toBe(terms.length)
    }
  })

  it('does not duplicate the full trait label as a search term', () => {
    for (const id of CREATURE_TRAIT_VOCABULARY_IDS) {
      const entry = getCreatureTraitVocabularyEntry(id)
      const label = entry?.label.toLowerCase() ?? ''
      const terms = getCreatureTraitSearchTerms(id).map((term) => term.toLowerCase())
      expect(terms).not.toContain(label)
    }
  })

  it('locks intentional discovery queries', () => {
    expect(getCreatureTraitSearchTerms('flyby')).toEqual(expect.arrayContaining(['flying']))
    expect(getCreatureTraitSearchTerms('freeze')).toEqual(expect.arrayContaining(['cold']))
    expect(getCreatureTraitSearchTerms('ethereal-sight')).toEqual(
      expect.arrayContaining(['ethereal', 'plane']),
    )
    expect(getCreatureTraitSearchTerms('amphibious')).toEqual(
      expect.arrayContaining(['air', 'water', 'breathe']),
    )
  })
})
