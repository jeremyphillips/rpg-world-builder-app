import { describe, expect, it } from 'vitest'

import {
  dedupeLanguageIds,
  resolveLanguageIdsFromGrantSet,
  resolveLanguagesFromChoiceSource,
  type CreatureLanguageOption,
} from './languages'

const testLanguages = [
  { id: 'common', label: 'Common', description: 'Trade language.', category: 'standard' },
  { id: 'elvish', label: 'Elvish', description: 'Elven language.', category: 'standard' },
  { id: 'dwarvish', label: 'Dwarvish', description: 'Dwarven language.', category: 'standard' },
  { id: 'abyssal', label: 'Abyssal', description: 'Infernal language.', category: 'rare' },
] as const satisfies readonly CreatureLanguageOption[]

describe('dedupeLanguageIds', () => {
  it('dedupes duplicate language ids', () => {
    expect(dedupeLanguageIds(['common', 'elvish', 'common', 'elvish'])).toEqual([
      'common',
      'elvish',
    ])
  })
})

describe('resolveLanguagesFromChoiceSource', () => {
  it('resolves explicit language ids', () => {
    expect(
      resolveLanguagesFromChoiceSource({
        languages: testLanguages,
        from: ['elvish', 'dwarvish'],
      }),
    ).toEqual([testLanguages[1], testLanguages[2]])
  })

  it('resolves language ids from categories', () => {
    expect(
      resolveLanguagesFromChoiceSource({
        languages: testLanguages,
        categories: ['standard'],
      }),
    ).toEqual([testLanguages[0], testLanguages[1], testLanguages[2]])
  })

  it('ignores unknown explicit ids', () => {
    expect(
      resolveLanguagesFromChoiceSource({
        languages: testLanguages,
        from: ['elvish', 'unknown-language'],
      }),
    ).toEqual([testLanguages[1]])
  })

  it('ignores unknown categories', () => {
    expect(
      resolveLanguagesFromChoiceSource({
        languages: testLanguages,
        categories: ['unknown-category'],
      }),
    ).toEqual([])
  })

  it('prefers explicit from ids over categories when from is non-empty', () => {
    expect(
      resolveLanguagesFromChoiceSource({
        languages: testLanguages,
        from: ['abyssal'],
        categories: ['standard'],
      }),
    ).toEqual([testLanguages[3]])
  })
})

describe('resolveLanguageIdsFromGrantSet', () => {
  it('combines explicit items and category expansion', () => {
    expect(
      resolveLanguageIdsFromGrantSet({
        grantSet: { items: ['common'], categories: ['standard'] },
        languages: testLanguages,
      }),
    ).toEqual(['common', 'elvish', 'dwarvish'])
  })

  it('dedupes duplicate language ids across items and categories', () => {
    expect(
      resolveLanguageIdsFromGrantSet({
        grantSet: { items: ['common', 'elvish'], categories: ['standard'] },
        languages: testLanguages,
      }),
    ).toEqual(['common', 'elvish', 'dwarvish'])
  })
})
