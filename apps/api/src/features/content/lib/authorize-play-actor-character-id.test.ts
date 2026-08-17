import { describe, expect, it } from 'vitest'

import { authorizePlayActorCharacterId } from './authorize-play-actor-character-id'

describe('authorizePlayActorCharacterId', () => {
  it('allows non-PC play actors without a character id check', () => {
    expect(
      authorizePlayActorCharacterId({
        playActor: { kind: 'new_pc' },
        pcCharacterIds: [],
      }),
    ).toEqual({ ok: true })
    expect(
      authorizePlayActorCharacterId({
        playActor: { kind: 'npc' },
        pcCharacterIds: [],
      }),
    ).toEqual({ ok: true })
  })

  it('allows PC actors in the authorized controlled set', () => {
    expect(
      authorizePlayActorCharacterId({
        playActor: { kind: 'pc', characterId: 'pc-a' },
        pcCharacterIds: ['pc-a', 'pc-b'],
      }),
    ).toEqual({ ok: true })
  })

  it('rejects PC actors outside the authorized controlled set', () => {
    expect(
      authorizePlayActorCharacterId({
        playActor: { kind: 'pc', characterId: 'pc-b' },
        pcCharacterIds: ['pc-a'],
      }),
    ).toEqual({ ok: false })
  })
})
