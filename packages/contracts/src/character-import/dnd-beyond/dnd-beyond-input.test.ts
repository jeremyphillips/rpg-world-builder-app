import { describe, expect, it } from 'vitest'

import { normalizeDndBeyondCharacterInput } from './dnd-beyond-input'

describe('normalizeDndBeyondCharacterInput', () => {
  it('accepts numeric ids', () => {
    expect(normalizeDndBeyondCharacterInput('133058471')).toBe('133058471')
  })

  it('accepts supported character URLs', () => {
    expect(normalizeDndBeyondCharacterInput('https://www.dndbeyond.com/characters/133058471')).toBe(
      '133058471',
    )
  })

  it('rejects arbitrary URLs', () => {
    expect(() => normalizeDndBeyondCharacterInput('https://example.com/characters/1')).toThrow()
  })
})
