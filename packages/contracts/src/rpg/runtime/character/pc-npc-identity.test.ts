import { describe, expect, it } from 'vitest'

import {
  CHARACTER_PC_NPC_IDS,
  CHARACTER_TYPE_IDS,
  CHARACTER_KINDS,
  CHARACTER_TYPES,
  characterKindSchema,
  characterPcNpcSchema,
  characterTypeSchema,
} from './pc-npc-identity'
import { CHARACTER_TYPE_ENTRIES } from './summary/character-type-display'
import { resolveCharacterKindPolicy } from '../character-builder/character-kind-policy'

describe('pc-npc-identity', () => {
  it('uses one schema instance for kind and type aliases', () => {
    expect(characterKindSchema).toBe(characterTypeSchema)
    expect(characterKindSchema).toBe(characterPcNpcSchema)
  })

  it('keeps compatibility tuple aliases referentially equal', () => {
    expect(CHARACTER_KINDS).toBe(CHARACTER_PC_NPC_IDS)
    expect(CHARACTER_TYPES).toBe(CHARACTER_PC_NPC_IDS)
    expect(CHARACTER_TYPE_IDS).toBe(CHARACTER_PC_NPC_IDS)
  })

  it('accepts pc and npc and rejects unknown ids', () => {
    expect(characterPcNpcSchema.safeParse('pc').success).toBe(true)
    expect(characterPcNpcSchema.safeParse('npc').success).toBe(true)
    expect(characterPcNpcSchema.safeParse('companion').success).toBe(false)
  })

  it('aligns display entries and kind policies with canonical ids', () => {
    expect(Object.keys(CHARACTER_TYPE_ENTRIES).sort()).toEqual([...CHARACTER_PC_NPC_IDS].sort())
    for (const id of CHARACTER_PC_NPC_IDS) {
      expect(() => resolveCharacterKindPolicy(id)).not.toThrow()
    }
  })
})
