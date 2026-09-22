import { describe, expect, it } from 'vitest'

import { resolveRelationshipPlayActor } from './character-relationship-play-actor.lib'

describe('resolveRelationshipPlayActor', () => {
  it('returns npc play actor without characterId', () => {
    expect(resolveRelationshipPlayActor('npc', 'npc-1')).toEqual({ kind: 'npc' })
  })

  it('returns pc play actor scoped to characterId', () => {
    expect(resolveRelationshipPlayActor('pc', 'char-a')).toEqual({
      kind: 'pc',
      characterId: 'char-a',
    })
  })
})
