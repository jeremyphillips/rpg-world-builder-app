import { describe, expect, it } from 'vitest'

import {
  resolveCharacterKindPolicy,
  resolveMagicItemGrantRequirement,
} from './character-kind-policy'

describe('character kind policy', () => {
  it('requires exact magic-item grants for player characters', () => {
    expect(resolveMagicItemGrantRequirement('pc')).toBe('exact')
    expect(resolveCharacterKindPolicy('pc')).toEqual({
      equipment: { magicItems: { requirement: 'exact' } },
    })
  })

  it('treats magic-item grants as optional for NPCs', () => {
    expect(resolveMagicItemGrantRequirement('npc')).toBe('up_to')
    expect(resolveCharacterKindPolicy('npc')).toEqual({
      equipment: { magicItems: { requirement: 'up_to' } },
    })
  })
})
