import { describe, expect, it } from 'vitest'

import { campaignBuildContextQueryKey } from './campaign-content-client'

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
