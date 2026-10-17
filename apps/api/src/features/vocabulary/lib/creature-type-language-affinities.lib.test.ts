import { describe, expect, it } from 'vitest'

import {
  mergeSystemEntryLanguageAffinitiesPatch,
  normalizeSystemCreatureTypeLanguageAffinitiesPatch,
  vocabularySetsEqual,
} from './creature-type-language-affinities.lib'

describe('creature type language affinities patch helpers', () => {
  it('compares affinity lists regardless of order', () => {
    expect(vocabularySetsEqual(['draconic', 'infernal'], ['infernal', 'draconic'])).toBe(true)
  })

  it('omits patch keys when submitted affinities match seed defaults', () => {
    expect(
      normalizeSystemCreatureTypeLanguageAffinitiesPatch('srd-cc-5.2.1', 'dragon', ['draconic']),
    ).toEqual({})
  })

  it('stores explicit clears and replacements', () => {
    expect(
      normalizeSystemCreatureTypeLanguageAffinitiesPatch('srd-cc-5.2.1', 'dragon', []),
    ).toEqual({ languageAffinities: [] })

    expect(
      normalizeSystemCreatureTypeLanguageAffinitiesPatch('srd-cc-5.2.1', 'dragon', ['infernal']),
    ).toEqual({ languageAffinities: ['infernal'] })
  })

  it('removes inherited patch keys when seed affinities are re-selected', () => {
    const merged = mergeSystemEntryLanguageAffinitiesPatch(
      'srd-cc-5.2.1',
      'dragon',
      { id: 'dragon', languageAffinities: [] },
      ['draconic'],
    )

    expect(merged).toEqual({ id: 'dragon' })
  })
})
