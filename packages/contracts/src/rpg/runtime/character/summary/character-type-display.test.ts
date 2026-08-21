import { describe, expect, it } from 'vitest'

import { getCharacterTypeLabel } from './character-type-display'

describe('getCharacterTypeLabel', () => {
  it('returns PC and NPC labels for known character types', () => {
    expect(getCharacterTypeLabel('pc')).toBe('PC')
    expect(getCharacterTypeLabel('npc')).toBe('NPC')
  })

  it('falls back to the raw value for unknown ids', () => {
    expect(getCharacterTypeLabel('companion')).toBe('companion')
  })
})
