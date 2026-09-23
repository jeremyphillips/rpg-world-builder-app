import { describe, expect, it } from 'vitest'

import { characterRelationshipsQueryKey } from './use-character-relationships'

describe('characterRelationshipsQueryKey', () => {
  it('returns a stable prefix so invalidation matches parameterized list queries', () => {
    const invalidationKey = characterRelationshipsQueryKey('camp-1', 'char-1')
    const listKey = characterRelationshipsQueryKey('camp-1', 'char-1', {
      limit: 100,
      kinds: undefined,
    })

    expect(invalidationKey).toEqual([
      'campaigns',
      'camp-1',
      'characters',
      'char-1',
      'relationships',
    ])
    expect(listKey.slice(0, invalidationKey.length)).toEqual(invalidationKey)
    expect(listKey).toEqual([
      'campaigns',
      'camp-1',
      'characters',
      'char-1',
      'relationships',
      null,
      null,
      100,
    ])
  })
})
