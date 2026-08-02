import { describe, expect, it } from 'vitest'

import { extractSpeciesLanguageIds } from './species'

describe('extractSpeciesLanguageIds', () => {
  it('collects language ids from languageAffinities', () => {
    expect(
      extractSpeciesLanguageIds({
        languageAffinities: ['common', 'elvish'],
      }),
    ).toEqual(['common', 'elvish'])
  })

  it('dedupes repeated language ids', () => {
    expect(
      extractSpeciesLanguageIds({
        languageAffinities: ['common', 'common'],
      }),
    ).toEqual(['common'])
  })
})
