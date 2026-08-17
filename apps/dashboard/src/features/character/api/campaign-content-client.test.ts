import { describe, expect, it } from 'vitest'

import {
  CONTENT_CATALOG_PLAY_SCOPE,
  CONTENT_CATALOG_SCOPE_QUERY,
  CONTENT_PLAY_ACTOR_KIND_QUERY,
  type ContentPlayActor,
} from '@rpg/contracts'

import {
  buildPlayCatalogQueryForTest,
  campaignBuildContextQueryKey,
} from './campaign-content-client'

describe('campaignBuildContextQueryKey', () => {
  it('isolates cache keys by play actor kind and character id', () => {
    expect(campaignBuildContextQueryKey('camp-1', { kind: 'new_pc' })).toEqual([
      'campaigns',
      'camp-1',
      'character-builder-context',
      'new_pc',
    ])
    expect(campaignBuildContextQueryKey('camp-1', { kind: 'npc' })).toEqual([
      'campaigns',
      'camp-1',
      'character-builder-context',
      'npc',
    ])
    expect(campaignBuildContextQueryKey('camp-1', { kind: 'pc', characterId: 'pc-a' })).toEqual([
      'campaigns',
      'camp-1',
      'character-builder-context',
      'pc-a',
    ])
  })
})

describe('buildPlayCatalogQueryForTest', () => {
  it('always sends play-catalog scope and actor params', () => {
    expect(buildPlayCatalogQueryForTest({ kind: 'new_pc' })).toBe(
      `?${CONTENT_CATALOG_SCOPE_QUERY}=${CONTENT_CATALOG_PLAY_SCOPE}&${CONTENT_PLAY_ACTOR_KIND_QUERY}=new_pc`,
    )
    expect(buildPlayCatalogQueryForTest({ kind: 'npc' })).toContain(
      `${CONTENT_PLAY_ACTOR_KIND_QUERY}=npc`,
    )
    expect(buildPlayCatalogQueryForTest({ kind: 'pc', characterId: 'pc-a' })).toContain(
      'playActorCharacterId=pc-a',
    )
  })

  it('covers every ContentPlayActor variant', () => {
    const actors: ContentPlayActor[] = [
      { kind: 'new_pc' },
      { kind: 'npc' },
      { kind: 'pc', characterId: 'pc-a' },
    ]

    for (const playActor of actors) {
      const query = buildPlayCatalogQueryForTest(playActor)
      expect(query).toContain(`${CONTENT_CATALOG_SCOPE_QUERY}=${CONTENT_CATALOG_PLAY_SCOPE}`)
    }
  })
})
