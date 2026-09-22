import { describe, expect, it } from 'vitest'

import { resolveCharacterGenderNameStyle } from './resolve-character-gender-name-style'

describe('resolveCharacterGenderNameStyle', () => {
  it('maps male to masculine', () => {
    expect(resolveCharacterGenderNameStyle('male')).toBe('masculine')
  })

  it('maps female to feminine', () => {
    expect(resolveCharacterGenderNameStyle('female')).toBe('feminine')
  })

  it('falls back to neutral when gender is unset', () => {
    expect(resolveCharacterGenderNameStyle(undefined)).toBe('neutral')
    expect(resolveCharacterGenderNameStyle(null)).toBe('neutral')
    expect(resolveCharacterGenderNameStyle('')).toBe('neutral')
  })
})
