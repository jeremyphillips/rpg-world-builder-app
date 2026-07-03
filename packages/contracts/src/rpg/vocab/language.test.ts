import { describe, expect, it } from 'vitest'

import {
  LANGUAGE_SET_ID,
  getLanguageCategorySentenceForm,
  getLanguageLabel,
  getLanguageSentenceForm,
  languageCategorySchema,
  languageIdSchema,
  languageSeedOptionSchema,
} from './language'

describe('languageIdSchema', () => {
  it('accepts slug-shaped ids including campaign custom terms', () => {
    expect(languageIdSchema.parse('common')).toBe('common')
    expect(languageIdSchema.parse('custom-tongue')).toBe('custom-tongue')
  })

  it('rejects invalid slug shapes', () => {
    expect(languageIdSchema.safeParse('Common').success).toBe(false)
    expect(languageIdSchema.safeParse('common').success).toBe(true)
  })
})

describe('languageSeedOptionSchema', () => {
  it('requires a standard or rare category', () => {
    expect(
      languageSeedOptionSchema.parse({
        id: 'common',
        label: 'Common',
        description: 'Trade language.',
        category: 'standard',
      }),
    ).toMatchObject({ id: 'common', category: 'standard' })

    expect(languageCategorySchema.safeParse('exotic').success).toBe(false)
  })
})

describe('language vocabulary', () => {
  it('registers the language option set id', () => {
    expect(LANGUAGE_SET_ID).toBe('languages')
  })

  it('returns title-cased slug labels', () => {
    expect(getLanguageLabel('common-sign-language')).toBe('Common Sign Language')
    expect(getLanguageLabel('thieves-cant')).toBe('Thieves Cant')
    expect(getLanguageLabel('custom-tongue')).toBe('Custom Tongue')
  })

  it('returns sentence forms for ids and categories', () => {
    expect(getLanguageSentenceForm('common')).toBe('Common')
    expect(getLanguageCategorySentenceForm('standard', 1)).toBe('standard language')
    expect(getLanguageCategorySentenceForm('standard', 2)).toBe('standard languages')
  })
})
