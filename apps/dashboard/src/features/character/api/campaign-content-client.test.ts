import { describe, expect, it } from 'vitest'

import { campaignBuildContextQueryKey } from './campaign-content-client'

describe('campaignBuildContextQueryKey', () => {
  it('isolates cache keys by scope, play actor kind, and character id', () => {
    expect(
      campaignBuildContextQueryKey('camp-1', { scope: 'play', playActor: { kind: 'new_pc' } }),
    ).toEqual(['campaigns', 'camp-1', 'character-builder-context', 'play', 'new_pc'])
    expect(
      campaignBuildContextQueryKey('camp-1', { scope: 'play', playActor: { kind: 'npc' } }),
    ).toEqual(['campaigns', 'camp-1', 'character-builder-context', 'play', 'npc'])
    expect(
      campaignBuildContextQueryKey('camp-1', {
        scope: 'play',
        playActor: { kind: 'pc', characterId: 'pc-a' },
      }),
    ).toEqual(['campaigns', 'camp-1', 'character-builder-context', 'play', 'pc-a'])
    expect(campaignBuildContextQueryKey('camp-1', { scope: 'reference' })).toEqual([
      'campaigns',
      'camp-1',
      'character-builder-context',
      'reference',
    ])
  })
})
