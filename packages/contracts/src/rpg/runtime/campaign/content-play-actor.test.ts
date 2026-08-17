import { describe, expect, it } from 'vitest'

import {
  CONTENT_CATALOG_PLAY_SCOPE,
  CONTENT_CATALOG_SCOPE_QUERY,
  CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY,
  CONTENT_PLAY_ACTOR_KIND_QUERY,
  isPlayCatalogScopeQuery,
  parseOptionalPlayActorFromQuery,
  parsePlayActorCharacterIdQuery,
  requirePlayActorFromQuery,
  resolveCatalogFilterPcCharacterIds,
  serializePlayActorQuery,
} from './content-play-actor'

describe('isPlayCatalogScopeQuery', () => {
  it('detects play-catalog scope requests', () => {
    expect(
      isPlayCatalogScopeQuery({ [CONTENT_CATALOG_SCOPE_QUERY]: CONTENT_CATALOG_PLAY_SCOPE }),
    ).toBe(true)
    expect(isPlayCatalogScopeQuery({ [CONTENT_CATALOG_SCOPE_QUERY]: 'discovery' })).toBe(false)
    expect(isPlayCatalogScopeQuery({})).toBe(false)
  })
})

describe('parsePlayActorCharacterIdQuery', () => {
  it('returns trimmed character ids and ignores empty values', () => {
    expect(
      parsePlayActorCharacterIdQuery({
        [CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]: '  pc-a  ',
      }),
    ).toBe('pc-a')
    expect(parsePlayActorCharacterIdQuery({ [CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]: '  ' })).toBe(
      undefined,
    )
    expect(parsePlayActorCharacterIdQuery({})).toBeUndefined()
  })
})

describe('parseOptionalPlayActorFromQuery', () => {
  it('returns undefined when no actor params are present', () => {
    expect(parseOptionalPlayActorFromQuery({})).toBeUndefined()
  })

  it('parses new_pc and npc kinds', () => {
    expect(parseOptionalPlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'new_pc' })).toEqual({
      kind: 'new_pc',
    })
    expect(parseOptionalPlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'npc' })).toEqual({
      kind: 'npc',
    })
  })

  it('parses pc actors from character id', () => {
    expect(
      parseOptionalPlayActorFromQuery({
        [CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]: 'pc-a',
      }),
    ).toEqual({ kind: 'pc', characterId: 'pc-a' })
  })

  it('ignores invalid kinds without throwing', () => {
    expect(
      parseOptionalPlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'invalid' }),
    ).toBeUndefined()
  })
})

describe('serializePlayActorQuery', () => {
  it.each([
    [{ kind: 'new_pc' } as const, { kind: 'new_pc' }],
    [{ kind: 'npc' } as const, { kind: 'npc' }],
    [{ kind: 'pc', characterId: 'pc-a' } as const, { kind: 'pc', characterId: 'pc-a' }],
  ])('round-trips %j through requirePlayActorFromQuery', (playActor, expected) => {
    const parsed = requirePlayActorFromQuery(serializePlayActorQuery(playActor))
    expect(parsed).toEqual({ ok: true, playActor: expected })
  })

  it('serializes pc actors via playActorCharacterId only', () => {
    expect(serializePlayActorQuery({ kind: 'pc', characterId: 'pc-a' })).toEqual({
      [CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]: 'pc-a',
    })
  })

  it('serializes non-pc actors via playActorKind only', () => {
    expect(serializePlayActorQuery({ kind: 'new_pc' })).toEqual({
      [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'new_pc',
    })
    expect(serializePlayActorQuery({ kind: 'npc' })).toEqual({
      [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'npc',
    })
  })
})

describe('requirePlayActorFromQuery', () => {
  it('requires an actor on builder routes', () => {
    expect(requirePlayActorFromQuery({})).toEqual({
      ok: false,
      error: {
        code: 'missing_play_actor',
        message: 'Builder catalog requests require playActorKind or playActorCharacterId.',
      },
    })
  })

  it('parses valid builder actor params', () => {
    expect(requirePlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'new_pc' })).toEqual({
      ok: true,
      playActor: { kind: 'new_pc' },
    })
    expect(requirePlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'npc' })).toEqual({
      ok: true,
      playActor: { kind: 'npc' },
    })
    expect(requirePlayActorFromQuery({ [CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]: 'pc-a' })).toEqual({
      ok: true,
      playActor: { kind: 'pc', characterId: 'pc-a' },
    })
  })

  it('rejects conflicting kind and character id params', () => {
    expect(
      requirePlayActorFromQuery({
        [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'new_pc',
        [CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]: 'pc-a',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'conflicting_play_actor_params',
        message: 'playActorKind and playActorCharacterId are mutually exclusive.',
      },
    })
  })

  it('rejects playActorKind=pc — PC actors require playActorCharacterId', () => {
    expect(requirePlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'pc' })).toEqual({
      ok: false,
      error: {
        code: 'invalid_play_actor_kind',
        message: 'Invalid playActorKind "pc". Expected new_pc or npc.',
      },
    })
  })

  it('rejects malformed actor params', () => {
    expect(requirePlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: 'invalid' })).toEqual({
      ok: false,
      error: {
        code: 'invalid_play_actor_kind',
        message: 'Invalid playActorKind "invalid". Expected new_pc or npc.',
      },
    })
    expect(requirePlayActorFromQuery({ [CONTENT_PLAY_ACTOR_KIND_QUERY]: '  ' })).toEqual({
      ok: false,
      error: {
        code: 'invalid_play_actor_kind',
        message: 'playActorKind must be a non-empty string.',
      },
    })
    expect(requirePlayActorFromQuery({ [CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]: '  ' })).toEqual({
      ok: false,
      error: {
        code: 'empty_play_actor_character_id',
        message: 'playActorCharacterId must be a non-empty string.',
      },
    })
  })
})

describe('resolveCatalogFilterPcCharacterIds', () => {
  it('narrows PC discovery to one play actor when the id is controlled', () => {
    expect(
      resolveCatalogFilterPcCharacterIds({
        campaignRole: 'pc',
        pcCharacterIds: ['pc-a', 'pc-b'],
        playActorCharacterId: 'pc-b',
      }),
    ).toEqual(['pc-b'])
  })

  it('ignores play actor narrowing for managers and unknown ids', () => {
    expect(
      resolveCatalogFilterPcCharacterIds({
        campaignRole: 'owner',
        pcCharacterIds: ['pc-a'],
        playActorCharacterId: 'pc-a',
      }),
    ).toEqual(['pc-a'])
    expect(
      resolveCatalogFilterPcCharacterIds({
        campaignRole: 'pc',
        pcCharacterIds: ['pc-a'],
        playActorCharacterId: 'pc-b',
      }),
    ).toEqual(['pc-a'])
  })
})
