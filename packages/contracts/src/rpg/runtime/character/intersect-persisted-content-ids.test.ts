import { describe, expect, it } from 'vitest'

import { intersectPersistedContentIds } from './intersect-persisted-content-ids'

describe('intersectPersistedContentIds', () => {
  const eligible = [{ id: 'b' }, { id: 'a' }, { id: 'c' }]

  it('preserves persisted order when eligible rows are unordered', () => {
    expect(intersectPersistedContentIds(['c', 'missing', 'a', 'b'], eligible)).toEqual([
      'c',
      'a',
      'b',
    ])
  })

  it('returns an empty list when nothing intersects', () => {
    expect(intersectPersistedContentIds(['x', 'y'], eligible)).toEqual([])
  })
})
