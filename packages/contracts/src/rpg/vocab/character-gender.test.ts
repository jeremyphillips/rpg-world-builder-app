import { describe, expect, it } from 'vitest'

import {
  CHARACTER_GENDERS,
  DEFAULT_CHARACTER_GENDER,
  genderSchema,
  getGenderLabel,
  normalizeStoredCharacterGender,
  optionalGenderSchema,
} from './character-gender'

describe('genderSchema', () => {
  it('accepts every known gender', () => {
    for (const gender of CHARACTER_GENDERS) {
      expect(genderSchema.parse(gender)).toBe(gender)
    }
  })

  it('rejects unknown genders', () => {
    expect(genderSchema.safeParse('other').success).toBe(false)
    expect(genderSchema.safeParse('male').success).toBe(true)
  })
})

describe('optionalGenderSchema', () => {
  it('treats blank select sentinels as unset', () => {
    expect(optionalGenderSchema.parse('')).toBeUndefined()
    expect(optionalGenderSchema.parse('male')).toBe('male')
  })
})

describe('normalizeStoredCharacterGender', () => {
  it('returns known genders unchanged', () => {
    expect(normalizeStoredCharacterGender('female')).toBe('female')
  })

  it('defaults missing or invalid stored values', () => {
    expect(normalizeStoredCharacterGender(undefined)).toBe(DEFAULT_CHARACTER_GENDER)
    expect(normalizeStoredCharacterGender(null)).toBe(DEFAULT_CHARACTER_GENDER)
    expect(normalizeStoredCharacterGender('')).toBe(DEFAULT_CHARACTER_GENDER)
    expect(normalizeStoredCharacterGender('other')).toBe(DEFAULT_CHARACTER_GENDER)
  })
})

describe('character gender vocabulary', () => {
  it('returns labels and falls back for unknown genders', () => {
    expect(getGenderLabel('male')).toBe('Male')
    expect(getGenderLabel('female')).toBe('Female')
    expect(getGenderLabel('custom')).toBe('custom')
  })
})
