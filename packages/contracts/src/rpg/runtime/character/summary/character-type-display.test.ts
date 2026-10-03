import { describe, expect, it } from 'vitest'

import {
  getCharacterTypeBulkActionDescriptor,
  getCharacterTypeCollectionLabel,
  getCharacterTypeLabel,
} from './character-type-display'

describe('getCharacterTypeLabel', () => {
  it('returns PC and NPC labels for known character types', () => {
    expect(getCharacterTypeLabel('pc')).toBe('PC')
    expect(getCharacterTypeLabel('npc')).toBe('NPC')
  })

  it('falls back to the raw value for unknown ids', () => {
    expect(getCharacterTypeLabel('companion')).toBe('companion')
  })
})

describe('getCharacterTypeCollectionLabel', () => {
  it('returns authored collection labels', () => {
    expect(getCharacterTypeCollectionLabel('pc')).toBe('PCs')
    expect(getCharacterTypeCollectionLabel('npc')).toBe('NPCs')
  })
})

describe('getCharacterTypeBulkActionDescriptor', () => {
  it('uses label and collectionLabel for bulk action nouns', () => {
    expect(getCharacterTypeBulkActionDescriptor('npc')).toEqual({
      nounSingular: 'NPC',
      nounPlural: 'NPCs',
    })
  })
})
