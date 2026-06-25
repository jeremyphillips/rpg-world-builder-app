import { describe, expect, it } from 'vitest'

import {
  LANGUAGE_ENTRIES,
  LANGUAGE_IDS,
  RARE_LANGUAGE_IDS,
  STANDARD_LANGUAGE_IDS,
  getLanguageEntry,
  getLanguageLabel,
  languageIdsByCategory,
  languageSchema,
} from './language'

describe('languageSchema', () => {
  it('accepts every known language', () => {
    for (const id of LANGUAGE_IDS) {
      expect(languageSchema.parse(id)).toBe(id)
    }
  })

  it('rejects display labels and unknown languages', () => {
    expect(languageSchema.safeParse('Common').success).toBe(false)
    expect(languageSchema.safeParse('telepathy').success).toBe(false)
    expect(languageSchema.safeParse('common').success).toBe(true)
  })
})

describe('language vocabulary', () => {
  it('derives LANGUAGE_IDS from the entry map', () => {
    expect([...LANGUAGE_IDS].sort()).toEqual(Object.keys(LANGUAGE_ENTRIES).sort())
  })

  it('groups standard and rare languages by category', () => {
    expect(languageIdsByCategory('standard').sort()).toEqual([...STANDARD_LANGUAGE_IDS].sort())
    expect(languageIdsByCategory('rare').sort()).toEqual([...RARE_LANGUAGE_IDS].sort())
    expect(STANDARD_LANGUAGE_IDS).toContain('common')
    expect(RARE_LANGUAGE_IDS).toContain('druidic')
  })

  it('only includes the authored description on Primordial', () => {
    expect(getLanguageEntry('primordial')?.description).toBe(
      'Primordial includes the Aquan, Auran, Ignan, and Terran dialects. Creatures that know one of these dialects can communicate with those that know a different one.',
    )
    expect(getLanguageEntry('common')?.description).toBeUndefined()
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getLanguageLabel('common-sign-language')).toBe('Common Sign Language')
    expect(getLanguageLabel('thieves-cant')).toBe("Thieves' Cant")
    expect(getLanguageLabel('custom')).toBe('custom')
  })
})
