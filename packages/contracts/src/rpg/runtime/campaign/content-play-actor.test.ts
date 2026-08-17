import { describe, expect, it } from 'vitest'

import {
  CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY,
  parsePlayActorCharacterIdQuery,
  resolveCatalogFilterPcCharacterIds,
} from './content-play-actor'

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
