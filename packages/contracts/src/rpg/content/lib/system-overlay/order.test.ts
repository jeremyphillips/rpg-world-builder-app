import { describe, expect, it } from 'vitest'

import { canonicalIdentityOrder, mergeCatalogSeedOrder } from './order'

describe('identity order helpers', () => {
  it('builds canonical seed-then-homebrew order', () => {
    const order = canonicalIdentityOrder(
      [{ id: 'a' }, { id: 'b' }],
      [
        { origin: 'homebrew', id: 'c', row: { id: 'c' } },
        { origin: 'homebrew', id: 'd', row: { id: 'd' } },
      ],
      new Set(['b']),
      'id',
    )
    expect(order).toEqual(['a', 'c', 'd'])
  })

  it('inserts new catalog seed ids after the nearest preceding stored seed id', () => {
    const live = new Set(['a', 'b', 'c', 'homebrew'])
    const merged = mergeCatalogSeedOrder(
      ['homebrew', 'a'],
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      live,
      'id',
    )
    expect(merged).toEqual(['homebrew', 'a', 'b', 'c'])
  })
})
