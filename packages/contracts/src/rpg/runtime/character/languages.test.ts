import { describe, expect, it } from 'vitest'

import { assembleLanguageProficiencyIds, mergeLanguageProficiencyEntries } from './languages'

describe('assembleLanguageProficiencyIds', () => {
  it('combines granted and selected ids', () => {
    expect(
      assembleLanguageProficiencyIds({
        grantedIds: ['common'],
        selectedIds: ['elvish', 'dwarvish'],
      }),
    ).toEqual({
      categories: [],
      items: ['common', 'elvish', 'dwarvish'],
    })
  })

  it('dedupes common when it appears as both granted and selected', () => {
    expect(
      assembleLanguageProficiencyIds({
        grantedIds: ['common'],
        selectedIds: ['common', 'elvish'],
      }),
    ).toEqual({
      categories: [],
      items: ['common', 'elvish'],
    })
  })

  it('returns empty items when no ids are provided', () => {
    expect(assembleLanguageProficiencyIds({})).toEqual({
      categories: [],
      items: [],
    })
  })
})

describe('mergeLanguageProficiencyEntries', () => {
  it('merges sources when the same language appears twice', () => {
    expect(
      mergeLanguageProficiencyEntries([
        {
          language: 'common',
          sources: [{ kind: 'characterCreation', sourceId: 'ruleset', grantId: 'language-grants' }],
        },
        {
          language: 'common',
          sources: [{ kind: 'characterCreation', sourceId: 'ruleset', grantId: 'choice-set' }],
        },
        {
          language: 'elvish',
          sources: [{ kind: 'characterCreation', sourceId: 'ruleset', grantId: 'choice-set' }],
        },
      ]),
    ).toEqual([
      {
        language: 'common',
        sources: [
          { kind: 'characterCreation', sourceId: 'ruleset', grantId: 'language-grants' },
          { kind: 'characterCreation', sourceId: 'ruleset', grantId: 'choice-set' },
        ],
      },
      {
        language: 'elvish',
        sources: [{ kind: 'characterCreation', sourceId: 'ruleset', grantId: 'choice-set' }],
      },
    ])
  })
})
